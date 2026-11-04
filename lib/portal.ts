export type ProjectStatus = "In ontwikkeling" | "Review" | "Opgeleverd" | "Gepland";
export type TicketPriority = "Laag" | "Normaal" | "Hoog";
export type TicketStatus = "Open" | "In behandeling" | "Gesloten";

export interface PortalProject {
  id: string;
  name: string;
  department: "Software" | "Game" | "Media";
  status: ProjectStatus;
  progress: number;
  deadline: string;
}

export interface PortalTicket {
  id: string;
  subject: string;
  priority: TicketPriority;
  status: TicketStatus;
  updated: string;
}

/** Mock data — replace with a database / CRM lookup keyed on the Discord user id. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getPortalData(userId: string) {
  const projects: PortalProject[] = [
    { id: "NS-1042", name: "Ticket Bot v2", department: "Software", status: "In ontwikkeling", progress: 68, deadline: "2026-11-20" },
    { id: "NS-1038", name: "Company Website", department: "Software", status: "Review", progress: 92, deadline: "2026-11-12" },
    { id: "NS-1031", name: "FiveM Garage Script", department: "Game", status: "Opgeleverd", progress: 100, deadline: "2026-10-28" },
    { id: "NS-1047", name: "Brand Refresh", department: "Media", status: "Gepland", progress: 10, deadline: "2026-12-15" },
  ];
  const tickets: PortalTicket[] = [
    { id: "T-311", subject: "Extra slash command voor rollen", priority: "Normaal", status: "In behandeling", updated: "2 uur geleden" },
    { id: "T-308", subject: "Contactformulier mail komt niet aan", priority: "Hoog", status: "Open", updated: "5 uur geleden" },
    { id: "T-297", subject: "Kleurwijziging garage NUI", priority: "Laag", status: "Gesloten", updated: "3 dagen geleden" },
  ];
  return { projects, tickets };
}
