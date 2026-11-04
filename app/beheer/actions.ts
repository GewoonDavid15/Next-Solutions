"use server";

import { revalidatePath } from "next/cache";
import {
  Department,
  Prisma,
  ProjectStatus,
  TicketPriority,
  TicketStatus,
} from "@prisma/client";
import { getAdmin } from "@/lib/admin";
import { notifyProjectStatus, notifyTicketStatus } from "@/lib/notify";
import { prisma } from "@/lib/db";

export interface ActionResult {
  ok: boolean;
  message?: string;
}

/** Every action re-checks admin rights; the page guard alone is not enough. */
async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) throw new Error("Geen toegang");
  return admin;
}

function done(message?: string): ActionResult {
  revalidatePath("/beheer");
  revalidatePath("/klantportaal");
  return { ok: true, message };
}

function failed(error: unknown, fallback: string): ActionResult {
  console.error(fallback, error);
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return { ok: false, message: "Die waarde bestaat al. Kies een andere." };
  }
  return { ok: false, message: fallback };
}

export async function setProjectStatus(id: string, status: ProjectStatus): Promise<ActionResult> {
  await requireAdmin();
  try {
    const project = await prisma.project.update({
      where: { id },
      data: {
        status,
        // Delivering a project implies it is finished.
        ...(status === "DELIVERED" ? { progress: 100 } : {}),
      },
      include: { customer: true },
    });
    await notifyProjectStatus(project, project.customer.name);
    return done();
  } catch (error) {
    return failed(error, "Status bijwerken is mislukt.");
  }
}

export async function setProjectProgress(id: string, progress: number): Promise<ActionResult> {
  await requireAdmin();
  const clamped = Math.min(100, Math.max(0, Math.round(progress)));
  try {
    await prisma.project.update({ where: { id }, data: { progress: clamped } });
    return done();
  } catch (error) {
    return failed(error, "Voortgang bijwerken is mislukt.");
  }
}

export async function setProjectDeadline(id: string, deadline: string): Promise<ActionResult> {
  await requireAdmin();
  const parsed = deadline ? new Date(deadline) : null;
  if (parsed && Number.isNaN(parsed.getTime())) {
    return { ok: false, message: "Ongeldige datum." };
  }
  try {
    await prisma.project.update({ where: { id }, data: { deadline: parsed } });
    return done();
  } catch (error) {
    return failed(error, "Deadline bijwerken is mislukt.");
  }
}

export async function setTicketStatus(id: string, status: TicketStatus): Promise<ActionResult> {
  await requireAdmin();
  try {
    const ticket = await prisma.ticket.update({
      where: { id },
      data: { status },
      include: { customer: true },
    });
    await notifyTicketStatus(ticket, ticket.customer.name);
    return done();
  } catch (error) {
    return failed(error, "Ticketstatus bijwerken is mislukt.");
  }
}

export async function setTicketPriority(id: string, priority: TicketPriority): Promise<ActionResult> {
  await requireAdmin();
  try {
    await prisma.ticket.update({ where: { id }, data: { priority } });
    return done();
  } catch (error) {
    return failed(error, "Prioriteit bijwerken is mislukt.");
  }
}

export async function createCustomer(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const discordId = String(formData.get("discordId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();

  if (!/^\d{17,20}$/.test(discordId)) {
    return { ok: false, message: "Een Discord user-id bestaat uit 17 tot 20 cijfers." };
  }
  if (name.length < 2) return { ok: false, message: "Vul een naam in." };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, message: "Vul een geldig e-mailadres in." };
  }

  try {
    await prisma.customer.create({ data: { discordId, name, email: email || null } });
    return done(`Klant ${name} toegevoegd.`);
  } catch (error) {
    return failed(error, "Klant aanmaken is mislukt.");
  }
}

export async function createProject(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const customerId = String(formData.get("customerId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const department = String(formData.get("department") ?? "") as Department;
  const deadline = String(formData.get("deadline") ?? "");

  if (!customerId) return { ok: false, message: "Kies een klant." };
  if (name.length < 2) return { ok: false, message: "Vul een projectnaam in." };
  if (!Object.values(Department).includes(department)) {
    return { ok: false, message: "Kies een afdeling." };
  }

  const parsed = deadline ? new Date(deadline) : null;
  if (parsed && Number.isNaN(parsed.getTime())) return { ok: false, message: "Ongeldige datum." };

  try {
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        await prisma.project.create({
          data: { reference: await nextProjectReference(), name, department, customerId, deadline: parsed },
        });
        return done(`Project ${name} aangemaakt.`);
      } catch (error) {
        const duplicate = error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
        if (!duplicate || attempt === 4) throw error;
      }
    }
    return { ok: false, message: "Project aanmaken is mislukt." };
  } catch (error) {
    return failed(error, "Project aanmaken is mislukt.");
  }
}

/** Highest existing number plus one; see the ticket equivalent for the trade-off. */
async function nextProjectReference(): Promise<string> {
  const existing = await prisma.project.findMany({ select: { reference: true } });
  const highest = existing.reduce((max, { reference }) => {
    const value = Number(reference.replace(/\D/g, ""));
    return Number.isFinite(value) && value > max ? value : max;
  }, 1000);
  return `NS-${highest + 1}`;
}

export async function deleteProject(id: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await prisma.project.delete({ where: { id } });
    return done("Project verwijderd.");
  } catch (error) {
    return failed(error, "Verwijderen is mislukt.");
  }
}
