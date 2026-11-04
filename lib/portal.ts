import "server-only";
import type {
  Department,
  ProjectStatus as DbProjectStatus,
  TicketPriority as DbTicketPriority,
  TicketStatus as DbTicketStatus,
} from "@prisma/client";
import { hasDatabase, prisma } from "@/lib/db";

export type ProjectStatus = "In ontwikkeling" | "Review" | "Opgeleverd" | "Gepland";
export type TicketPriority = "Laag" | "Normaal" | "Hoog";
export type TicketStatus = "Open" | "In behandeling" | "Gesloten";

export interface PortalProject {
  id: string;
  name: string;
  department: "Software" | "Game" | "Media";
  status: ProjectStatus;
  progress: number;
  deadline: string | null;
}

export interface PortalTicket {
  id: string;
  subject: string;
  priority: TicketPriority;
  status: TicketStatus;
  updated: string;
}

export interface PortalData {
  projects: PortalProject[];
  tickets: PortalTicket[];
  /** False when the data below is demo content rather than a real customer record. */
  live: boolean;
}

const departmentLabels: Record<Department, PortalProject["department"]> = {
  SOFTWARE: "Software",
  GAME: "Game",
  MEDIA: "Media",
};

const projectStatusLabels: Record<DbProjectStatus, ProjectStatus> = {
  PLANNED: "Gepland",
  IN_PROGRESS: "In ontwikkeling",
  REVIEW: "Review",
  DELIVERED: "Opgeleverd",
};

const ticketPriorityLabels: Record<DbTicketPriority, TicketPriority> = {
  LOW: "Laag",
  NORMAL: "Normaal",
  HIGH: "Hoog",
};

const ticketStatusLabels: Record<DbTicketStatus, TicketStatus> = {
  OPEN: "Open",
  IN_PROGRESS: "In behandeling",
  CLOSED: "Gesloten",
};

/** "2 uur geleden", "3 dagen geleden", … */
function relativeTime(date: Date): string {
  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31_536_000],
    ["month", 2_592_000],
    ["day", 86_400],
    ["hour", 3_600],
    ["minute", 60],
  ];
  const formatter = new Intl.RelativeTimeFormat("nl-NL", { numeric: "auto" });
  for (const [unit, secondsPerUnit] of units) {
    if (seconds >= secondsPerUnit) return formatter.format(-Math.floor(seconds / secondsPerUnit), unit);
  }
  return "zojuist";
}

/** Demo content, used for the demo login and whenever no database is configured. */
function demoData(): PortalData {
  const inDays = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString();
  return {
    live: false,
    projects: [
      { id: "NS-1042", name: "Ticket Bot v2", department: "Software", status: "In ontwikkeling", progress: 68, deadline: inDays(16) },
      { id: "NS-1038", name: "Company Website", department: "Software", status: "Review", progress: 92, deadline: inDays(8) },
      { id: "NS-1031", name: "FiveM Garage Script", department: "Game", status: "Opgeleverd", progress: 100, deadline: inDays(-7) },
      { id: "NS-1047", name: "Brand Refresh", department: "Media", status: "Gepland", progress: 10, deadline: inDays(41) },
    ],
    tickets: [
      { id: "T-311", subject: "Extra slash command voor rollen", priority: "Normaal", status: "In behandeling", updated: "2 uur geleden" },
      { id: "T-308", subject: "Contactformulier mail komt niet aan", priority: "Hoog", status: "Open", updated: "5 uur geleden" },
      { id: "T-297", subject: "Kleurwijziging garage NUI", priority: "Laag", status: "Gesloten", updated: "3 dagen geleden" },
    ],
  };
}

/**
 * Loads the projects and tickets belonging to a Discord user.
 *
 * Returns demo content when no database is configured, when the lookup fails,
 * or when the Discord account is not linked to a customer record yet — the
 * portal stays usable either way, and `live` says which case you are looking at.
 */
export async function getPortalData(discordId: string, { demo = false } = {}): Promise<PortalData> {
  if (demo || !hasDatabase) return demoData();

  try {
    const customer = await prisma.customer.findUnique({
      where: { discordId },
      include: {
        projects: { orderBy: { updatedAt: "desc" } },
        tickets: { orderBy: { updatedAt: "desc" } },
      },
    });

    if (!customer) return { projects: [], tickets: [], live: true };

    return {
      live: true,
      projects: customer.projects.map((p) => ({
        id: p.reference,
        name: p.name,
        department: departmentLabels[p.department],
        status: projectStatusLabels[p.status],
        progress: p.progress,
        deadline: p.deadline ? p.deadline.toISOString() : null,
      })),
      tickets: customer.tickets.map((t) => ({
        id: t.reference,
        subject: t.subject,
        priority: ticketPriorityLabels[t.priority],
        status: ticketStatusLabels[t.status],
        updated: relativeTime(t.updatedAt),
      })),
    };
  } catch (error) {
    console.error("Klantportaal: database niet bereikbaar, demo-data getoond.", error);
    return demoData();
  }
}
