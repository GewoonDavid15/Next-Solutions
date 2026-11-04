import "server-only";
import type { Project, Ticket } from "@prisma/client";

const COLORS = { new: 0x7c3aed, progress: 0x38bdf8, done: 0x34d399, closed: 0x71717a } as const;

const projectStatusLabels = {
  PLANNED: "Gepland",
  IN_PROGRESS: "In ontwikkeling",
  REVIEW: "Review",
  DELIVERED: "Opgeleverd",
} as const;

const ticketStatusLabels = {
  OPEN: "Open",
  IN_PROGRESS: "In behandeling",
  CLOSED: "Gesloten",
} as const;

const priorityLabels = { LOW: "Laag", NORMAL: "Normaal", HIGH: "Hoog" } as const;

interface Embed {
  title: string;
  color: number;
  fields: { name: string; value: string; inline?: boolean }[];
}

const clip = (text: string, max = 1000) => (text.length > max ? `${text.slice(0, max)}…` : text);

/**
 * Posts to the staff Discord channel. Never throws and never blocks the caller's
 * own work: a failed notification must not fail a ticket that was already saved.
 *
 * Note this reaches your own channel, not the customer. Messaging customers
 * directly would need a Discord bot with its own permissions.
 */
async function post(embed: Embed): Promise<void> {
  const webhook = process.env.DISCORD_NOTIFY_WEBHOOK_URL ?? process.env.DISCORD_CONTACT_WEBHOOK_URL;
  if (!webhook) return;

  try {
    const response = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "Next Solutions Portaal",
        allowed_mentions: { parse: [] },
        embeds: [{ ...embed, timestamp: new Date().toISOString() }],
      }),
    });
    if (!response.ok) {
      console.error(`Discord-notificatie geweigerd met status ${response.status}.`);
    }
  } catch (error) {
    console.error("Discord-notificatie versturen is mislukt:", error);
  }
}

export async function notifyNewTicket(ticket: Ticket, customerName: string, projectName?: string) {
  await post({
    title: `Nieuw ticket ${ticket.reference}`,
    color: COLORS.new,
    fields: [
      { name: "Klant", value: clip(customerName, 100), inline: true },
      { name: "Prioriteit", value: priorityLabels[ticket.priority], inline: true },
      { name: "Project", value: projectName ? clip(projectName, 100) : "—", inline: true },
      { name: "Onderwerp", value: clip(ticket.subject) },
    ],
  });
}

export async function notifyTicketStatus(ticket: Ticket, customerName: string) {
  await post({
    title: `Ticket ${ticket.reference} is nu ${ticketStatusLabels[ticket.status].toLowerCase()}`,
    color: ticket.status === "CLOSED" ? COLORS.closed : COLORS.progress,
    fields: [
      { name: "Klant", value: clip(customerName, 100), inline: true },
      { name: "Status", value: ticketStatusLabels[ticket.status], inline: true },
      { name: "Onderwerp", value: clip(ticket.subject) },
    ],
  });
}

export async function notifyProjectStatus(project: Project, customerName: string) {
  await post({
    title: `${project.reference} — ${projectStatusLabels[project.status]}`,
    color: project.status === "DELIVERED" ? COLORS.done : COLORS.progress,
    fields: [
      { name: "Klant", value: clip(customerName, 100), inline: true },
      { name: "Project", value: clip(project.name, 100), inline: true },
      { name: "Voortgang", value: `${project.progress}%`, inline: true },
    ],
  });
}
