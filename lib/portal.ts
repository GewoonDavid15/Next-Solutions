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
export function getPortalData(userId: string, locale: "nl" | "en" = "nl") {
  const en = locale === "en";
  const projects: PortalProject[] = [
    { id: "NS-1042", name: "Ticket Bot v2", department: "Software", status: "In ontwikkeling", progress: 68, deadline: "2026-11-20" },
    { id: "NS-1038", name: "Company Website", department: "Software", status: "Review", progress: 92, deadline: "2026-11-12" },
    { id: "NS-1031", name: "FiveM Garage Script", department: "Game", status: "Opgeleverd", progress: 100, deadline: "2026-10-28" },
    { id: "NS-1047", name: "Brand Refresh", department: "Media", status: "Gepland", progress: 10, deadline: "2026-12-15" },
  ];
  const tickets: PortalTicket[] = [
    { id: "T-311", subject: en ? "Extra slash command for roles" : "Extra slash command voor rollen", priority: "Normaal", status: "In behandeling", updated: en ? "2 hours ago" : "2 uur geleden" },
    { id: "T-308", subject: en ? "Contact form email does not arrive" : "Contactformulier mail komt niet aan", priority: "Hoog", status: "Open", updated: en ? "5 hours ago" : "5 uur geleden" },
    { id: "T-297", subject: en ? "Colour change garage NUI" : "Kleurwijziging garage NUI", priority: "Laag", status: "Gesloten", updated: en ? "3 days ago" : "3 dagen geleden" },
  ];
  return { projects, tickets };
}
