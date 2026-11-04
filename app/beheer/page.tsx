import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { getAdmin } from "@/lib/admin";
import { hasDatabase, prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Beheer",
  robots: { index: false, follow: false },
};

export default async function BeheerPage() {
  const admin = await getAdmin();
  // Anyone who is not an admin lands on the normal portal: not signed in, signed
  // in as a customer, or no database configured all look the same from outside.
  if (!admin || !hasDatabase) redirect("/klantportaal");

  const [customers, projects, tickets] = await Promise.all([
    prisma.customer.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { projects: true, tickets: true } } },
    }),
    prisma.project.findMany({ orderBy: { updatedAt: "desc" }, include: { customer: true } }),
    prisma.ticket.findMany({ orderBy: { updatedAt: "desc" }, include: { customer: true, project: true } }),
  ]);

  return (
    <AdminDashboard
      adminName={admin.globalName ?? admin.username}
      customers={customers.map((c) => ({
        id: c.id,
        name: c.name,
        discordId: c.discordId,
        email: c.email,
        projectCount: c._count.projects,
        ticketCount: c._count.tickets,
        createdAt: c.createdAt.toISOString(),
      }))}
      projects={projects.map((p) => ({
        id: p.id,
        reference: p.reference,
        name: p.name,
        customer: p.customer.name,
        department: p.department,
        status: p.status,
        progress: p.progress,
        deadline: p.deadline ? p.deadline.toISOString().slice(0, 10) : "",
      }))}
      tickets={tickets.map((t) => ({
        id: t.id,
        reference: t.reference,
        subject: t.subject,
        customer: t.customer.name,
        project: t.project?.reference ?? null,
        priority: t.priority,
        status: t.status,
        updatedAt: t.updatedAt.toISOString(),
      }))}
    />
  );
}
