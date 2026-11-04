"use client";

import { motion } from "framer-motion";
import { FolderKanban, Loader2, LogOut, Ticket, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { NewCustomerDialog } from "@/components/admin/NewCustomerDialog";
import { NewProjectDialog } from "@/components/admin/NewProjectDialog";
import { Button } from "@/components/ui/Button";
import { InlineSelect } from "@/components/ui/InlineSelect";
import {
  deleteProject,
  setProjectDeadline,
  setProjectProgress,
  setProjectStatus,
  setTicketPriority,
  setTicketStatus,
} from "@/app/beheer/actions";
import { cn } from "@/lib/utils";

export interface AdminCustomer {
  id: string;
  name: string;
  discordId: string;
  email: string | null;
  projectCount: number;
  ticketCount: number;
  createdAt: string;
}
export interface AdminProject {
  id: string;
  reference: string;
  name: string;
  customer: string;
  department: string;
  status: string;
  progress: number;
  deadline: string;
}
export interface AdminTicket {
  id: string;
  reference: string;
  subject: string;
  customer: string;
  project: string | null;
  priority: string;
  status: string;
  updatedAt: string;
}

const projectStatuses = [
  { value: "PLANNED", label: "Gepland" },
  { value: "IN_PROGRESS", label: "In ontwikkeling" },
  { value: "REVIEW", label: "Review" },
  { value: "DELIVERED", label: "Opgeleverd" },
];
const ticketStatuses = [
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In behandeling" },
  { value: "CLOSED", label: "Gesloten" },
];
const priorities = [
  { value: "LOW", label: "Laag" },
  { value: "NORMAL", label: "Normaal" },
  { value: "HIGH", label: "Hoog" },
];
const departments: Record<string, string> = { SOFTWARE: "Software", GAME: "Game", MEDIA: "Media" };

const tabs = [
  { id: "projects", label: "Projecten", icon: FolderKanban },
  { id: "tickets", label: "Tickets", icon: Ticket },
  { id: "customers", label: "Klanten", icon: Users },
] as const;

type Tab = (typeof tabs)[number]["id"];

export function AdminDashboard({
  adminName,
  customers,
  projects,
  tickets,
}: {
  adminName: string;
  customers: AdminCustomer[];
  projects: AdminProject[];
  tickets: AdminTicket[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("projects");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  /** Runs a server action and pulls the fresh rows back in. */
  function run(action: () => Promise<{ ok: boolean; message?: string }>) {
    setError("");
    startTransition(async () => {
      const result = await action();
      if (!result.ok) setError(result.message ?? "Er ging iets mis.");
      router.refresh();
    });
  }

  const openTickets = tickets.filter((t) => t.status !== "CLOSED").length;
  const activeProjects = projects.filter((p) => p.status !== "DELIVERED").length;

  return (
    <section className="pb-16 pt-32 sm:pt-36">
      <div className="container">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-zinc-400">Beheer</p>
            <h1 className="text-3xl font-semibold">Hallo {adminName}</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <NewCustomerDialog onDone={() => router.refresh()} />
            <NewProjectDialog customers={customers} onDone={() => router.refresh()} />
            <Button asChild variant="ghost" size="sm">
              <Link href="/klantportaal">Klantweergave</Link>
            </Button>
            <form action="/api/auth/logout" method="post">
              <Button type="submit" variant="ghost" size="sm">
                <LogOut /> Uitloggen
              </Button>
            </form>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Kpi icon={FolderKanban} label="Actieve projecten" value={activeProjects} />
          <Kpi icon={Ticket} label="Open tickets" value={openTickets} />
          <Kpi icon={Users} label="Klanten" value={customers.length} />
        </div>

        {error && (
          <p role="alert" className="mt-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
            {error}
          </p>
        )}

        <div className="glass mt-8 overflow-hidden rounded-3xl">
          <div className="flex items-center justify-between gap-4 border-b border-white/5 p-4 sm:p-6">
            <div role="tablist" className="flex gap-1 rounded-2xl bg-white/[0.03] p-1">
              {tabs.map(({ id, label }) => (
                <button
                  key={id}
                  role="tab"
                  aria-selected={tab === id}
                  onClick={() => setTab(id)}
                  className={cn(
                    "relative rounded-xl px-4 py-2 font-display text-sm",
                    tab === id ? "text-white" : "text-zinc-400 hover:text-white",
                  )}
                >
                  {tab === id && <motion.span layoutId="admin-tab" className="absolute inset-0 -z-10 rounded-xl bg-brand-gradient shadow-glow" />}
                  {label}
                </button>
              ))}
            </div>
            {pending && (
              <span className="flex items-center gap-2 text-xs text-zinc-400">
                <Loader2 className="size-3.5 animate-spin" /> Opslaan…
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            {tab === "projects" && (
              <table className="w-full min-w-[920px] text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-zinc-500">
                  <tr>
                    <Th>Project</Th><Th>Klant</Th><Th>Status</Th><Th>Voortgang</Th><Th>Deadline</Th><Th>　</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {projects.length === 0 && <Empty colSpan={6}>Nog geen projecten.</Empty>}
                  {projects.map((p) => (
                    <tr key={p.id} className="transition-colors hover:bg-white/[0.02]">
                      <Td>
                        <p className="font-medium text-white">{p.name}</p>
                        <p className="text-xs text-zinc-500">
                          {p.reference} · {departments[p.department] ?? p.department}
                        </p>
                      </Td>
                      <Td className="text-zinc-300">{p.customer}</Td>
                      <Td>
                        <InlineSelect
                          label={`Status van ${p.name}`}
                          value={p.status}
                          options={projectStatuses}
                          onChange={(v) => run(() => setProjectStatus(p.id, v as never))}
                        />
                      </Td>
                      <Td>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          defaultValue={p.progress}
                          aria-label={`Voortgang van ${p.name} in procenten`}
                          onBlur={(e) => {
                            const next = Number(e.target.value);
                            if (next !== p.progress) run(() => setProjectProgress(p.id, next));
                          }}
                          className="h-9 w-20 rounded-xl border border-white/10 bg-white/[0.03] px-3 text-sm text-white focus:border-brand-500 focus:outline-none"
                        />
                      </Td>
                      <Td>
                        <input
                          type="date"
                          defaultValue={p.deadline}
                          aria-label={`Deadline van ${p.name}`}
                          onChange={(e) => run(() => setProjectDeadline(p.id, e.target.value))}
                          className="h-9 rounded-xl border border-white/10 bg-white/[0.03] px-3 text-sm text-white [color-scheme:dark] focus:border-brand-500 focus:outline-none"
                        />
                      </Td>
                      <Td>
                        <button
                          onClick={() => {
                            if (confirm(`Project "${p.name}" verwijderen? Dit kan niet ongedaan gemaakt worden.`)) {
                              run(() => deleteProject(p.id));
                            }
                          }}
                          aria-label={`Project ${p.name} verwijderen`}
                          className="grid size-9 place-items-center rounded-xl text-zinc-500 transition hover:bg-rose-500/10 hover:text-rose-300"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {tab === "tickets" && (
              <table className="w-full min-w-[920px] text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-zinc-500">
                  <tr>
                    <Th>Ticket</Th><Th>Klant</Th><Th>Project</Th><Th>Prioriteit</Th><Th>Status</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {tickets.length === 0 && <Empty colSpan={5}>Nog geen tickets.</Empty>}
                  {tickets.map((t) => (
                    <tr key={t.id} className="transition-colors hover:bg-white/[0.02]">
                      <Td>
                        <p className="font-medium text-white">{t.subject}</p>
                        <p className="text-xs text-zinc-500">{t.reference}</p>
                      </Td>
                      <Td className="text-zinc-300">{t.customer}</Td>
                      <Td className="text-zinc-400">{t.project ?? "—"}</Td>
                      <Td>
                        <InlineSelect
                          label={`Prioriteit van ${t.reference}`}
                          value={t.priority}
                          options={priorities}
                          onChange={(v) => run(() => setTicketPriority(t.id, v as never))}
                        />
                      </Td>
                      <Td>
                        <InlineSelect
                          label={`Status van ${t.reference}`}
                          value={t.status}
                          options={ticketStatuses}
                          onChange={(v) => run(() => setTicketStatus(t.id, v as never))}
                        />
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {tab === "customers" && (
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-zinc-500">
                  <tr>
                    <Th>Klant</Th><Th>Discord-id</Th><Th>E-mail</Th><Th>Projecten</Th><Th>Tickets</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {customers.length === 0 && <Empty colSpan={5}>Nog geen klanten.</Empty>}
                  {customers.map((c) => (
                    <tr key={c.id} className="transition-colors hover:bg-white/[0.02]">
                      <Td className="font-medium text-white">{c.name}</Td>
                      <Td className="font-mono text-xs text-zinc-400">{c.discordId}</Td>
                      <Td className="text-zinc-400">{c.email ?? "—"}</Td>
                      <Td className="tabular-nums text-zinc-300">{c.projectCount}</Td>
                      <Td className="tabular-nums text-zinc-300">{c.ticketCount}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Kpi({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: number }) {
  return (
    <div className="glass flex items-center gap-4 rounded-3xl p-6">
      <span className="grid size-12 place-items-center rounded-2xl bg-brand-600/15 text-brand-300">
        <Icon className="size-6" />
      </span>
      <div>
        <p className="font-display text-3xl font-semibold text-white">{value}</p>
        <p className="text-sm text-zinc-400">{label}</p>
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-6 py-4 font-medium">{children}</th>;
}
function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("px-6 py-4", className)}>{children}</td>;
}
function Empty({ colSpan, children }: { colSpan: number; children: React.ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-10 text-center text-zinc-500">
        {children}
      </td>
    </tr>
  );
}
