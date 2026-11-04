"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { Prisma, TicketPriority } from "@prisma/client";
import { hasDatabase, prisma } from "@/lib/db";
import { notifyNewTicket } from "@/lib/notify";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { getSession } from "@/lib/session";

export interface TicketFormState {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: { subject?: string; priority?: string };
  /** Reference of the ticket just created; also marks this result as a new one. */
  reference?: string;
}

const priorities = ["LOW", "NORMAL", "HIGH"] as const;

/** Three new tickets per customer per hour. */
const LIMIT = 3;
const WINDOW_MS = 60 * 60 * 1000;

/**
 * Picks the next free ticket reference (T-312, T-313, …).
 *
 * References are numbered as text, so the highest number is found in code
 * rather than by sorting in the database. That means reading every reference;
 * fine for the volumes a client portal sees, but swap it for a database
 * sequence if the table ever grows into the tens of thousands.
 *
 * References are shared across customers, so two people submitting at the same
 * moment can land on the same number; the unique constraint catches that and
 * the caller retries.
 */
async function nextReference(): Promise<string> {
  const existing = await prisma.ticket.findMany({ select: { reference: true } });
  const highest = existing.reduce((max, { reference }) => {
    const value = Number(reference.replace(/\D/g, ""));
    return Number.isFinite(value) && value > max ? value : max;
  }, 300);
  return `T-${highest + 1}`;
}

export async function createTicket(_prev: TicketFormState, formData: FormData): Promise<TicketFormState> {
  const session = await getSession();
  if (!session) return { status: "error", message: "Je sessie is verlopen. Log opnieuw in." };

  if (session.demo) {
    return { status: "error", message: "In de demo kun je geen ticket aanmaken. Log in met Discord om dit te gebruiken." };
  }
  if (!hasDatabase) {
    return { status: "error", message: "Er is nog geen database gekoppeld, dus tickets kunnen niet opgeslagen worden." };
  }

  const subject = String(formData.get("subject") ?? "").trim();
  const priority = String(formData.get("priority") ?? "NORMAL");
  const projectId = String(formData.get("projectId") ?? "");

  const errors: TicketFormState["errors"] = {};
  if (subject.length < 5) errors.subject = "Omschrijf je vraag in minimaal 5 tekens";
  if (subject.length > 200) errors.subject = "Maximaal 200 tekens";
  if (!priorities.includes(priority as (typeof priorities)[number])) errors.priority = "Kies een prioriteit";
  if (Object.keys(errors).length) return { status: "error", errors };

  // Counted only once the input is valid, so a typo does not cost an attempt.
  const limit = rateLimit(clientKey(await headers(), `ticket:${session.id}`), LIMIT, WINDOW_MS);
  if (!limit.allowed) {
    return { status: "error", message: "Je hebt net al een paar tickets aangemaakt. Probeer het over een uur opnieuw." };
  }

  try {
    const customer = await prisma.customer.findUnique({
      where: { discordId: session.id },
      select: { id: true, name: true, projects: { select: { id: true, reference: true } } },
    });
    if (!customer) {
      return { status: "error", message: "Je Discord-account is nog niet aan een klant gekoppeld. Neem contact met ons op." };
    }

    // Only accept a project that belongs to this customer.
    const project = customer.projects.find((p) => p.reference === projectId);

    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const created = await prisma.ticket.create({
          data: {
            reference: await nextReference(),
            subject,
            priority: priority as TicketPriority,
            customerId: customer.id,
            projectId: project?.id ?? null,
          },
        });
        await notifyNewTicket(created, customer.name, project?.reference);
        revalidatePath("/klantportaal");
        revalidatePath("/beheer");
        return {
          status: "success",
          reference: created.reference,
          message: "We reageren meestal binnen een paar uur.",
        };
      } catch (error) {
        const isDuplicate = error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
        if (!isDuplicate || attempt === 4) throw error;
      }
    }
    return { status: "error", message: "Aanmaken is niet gelukt. Probeer het opnieuw." };
  } catch (error) {
    console.error("Ticket aanmaken mislukt:", error);
    return { status: "error", message: "Er ging iets mis bij het opslaan. Probeer het later opnieuw." };
  }
}
