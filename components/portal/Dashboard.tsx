"use client";

import { motion } from "framer-motion";
import { Bot, CheckCircle2, Clock, FolderKanban, LifeBuoy, LogOut, Plus, Ticket } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { Button } from "@/components/ui/Button";
import type { PortalProject, PortalTicket, ProjectStatus, TicketPriority, TicketStatus } from "@/lib/portal";
import { cn } from "@/lib/utils";

interface DashboardProps {
  user: { name: string; avatar: string | null; demo?: boolean };
  /** Shows a link to the bot dashboard (only for the owner). */
  isOwner?: boolean;
  projects: PortalProject[];
  tickets: PortalTicket[];
}

const projectStatusStyle: Record<ProjectStatus, string> = {
  "In ontwikkeling": "bg-brand-600/15 text-brand-200 border-brand-500/30",
  Review: "bg-amber-500/10 text-amber-200 border-amber-500/30",
  Opgeleverd: "bg-emerald-500/10 text-emerald-200 border-emerald-500/30",
  Gepland: "bg-sky-500/10 text-sky-200 border-sky-500/30",
};
const ticketStatusStyle: Record<TicketStatus, string> = {
  Open: "bg-rose-500/10 text-rose-200 border-rose-500/30",
  "In behandeling": "bg-brand-600/15 text-brand-200 border-brand-500/30",
  Gesloten: "bg-white/5 text-zinc-400 border-white/10",
};
const priorityStyle: Record<TicketPriority, string> = {
  Laag: "text-zinc-400",
  Normaal: "text-sky-300",
  Hoog: "text-rose-300",
};

/** English labels for the demo statuses (the values themselves stay Dutch). */
const labelsEn: Record<string, string> = {
  "In ontwikkeling": "In development",
  Opgeleverd: "Delivered",
  Gepland: "Planned",
  "In behandeling": "In progress",
  Gesloten: "Closed",
  Laag: "Low",
  Normaal: "Normal",
  Hoog: "High",
};

export function Dashboard({ user, projects, tickets, isOwner = false }: DashboardProps) {
  const { locale, lp } = useI18n();
  const en = locale === "en";
  const label = (v: string) => (en ? (labelsEn[v] ?? v) : v);
  const [tab, setTab] = useState<"projects" | "tickets">("projects");

  const kpis = [
    { label: en ? "Active projects" : "Actieve projecten", value: projects.filter((p) => p.status !== "Opgeleverd").length, icon: FolderKanban },
    { label: en ? "Delivered" : "Opgeleverd", value: projects.filter((p) => p.status === "Opgeleverd").length, icon: CheckCircle2 },
    { label: "Open tickets", value: tickets.filter((t) => t.status !== "Gesloten").length, icon: Ticket },
  ];

  return (
    <section className="pb-12 pt-32 sm:pt-36">
      <div className="container">
        {/* Header */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {user.avatar ? (
              <Image src={user.avatar} alt="" width={56} height={56} className="size-14 rounded-2xl border border-white/10" />
            ) : (
              <span className="grid size-14 place-items-center rounded-2xl bg-brand-gradient font-display text-xl font-semibold text-white">
                {user.name.charAt(0).toUpperCase()}
              </span>
            )}
            <div>
              <p className="text-sm text-zinc-400">{en ? "Welcome back" : "Welkom terug"}{user.demo && " (demo)"}</p>
              <h1 className="text-3xl font-semibold">{user.name}</h1>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {isOwner && (
              <Button asChild size="sm" variant="secondary">
                <Link href="/dashboard"><Bot /> Bot-dashboard</Link>
              </Button>
            )}
            <Button asChild size="sm">
              <Link href={lp("/contact")}><Plus /> {en ? "New project" : "Nieuw project"}</Link>
            </Button>
            <form action={en ? "/api/auth/logout?taal=en" : "/api/auth/logout"} method="post">
              <Button type="submit" variant="secondary" size="sm"><LogOut /> {en ? "Log out" : "Uitloggen"}</Button>
            </form>
          </div>
        </div>

        {/* KPIs */}
        <Stagger className="mt-10 grid gap-4 sm:grid-cols-3">
          {kpis.map(({ label, value, icon: Icon }) => (
            <StaggerItem key={label} className="glass flex items-center gap-4 rounded-3xl p-6">
              <span className="grid size-12 place-items-center rounded-2xl bg-brand-600/15 text-brand-300">
                <Icon className="size-6" />
              </span>
              <div>
                <p className="font-display text-3xl font-semibold text-white">{value}</p>
                <p className="text-sm text-zinc-400">{label}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        {/* Table */}
        <div className="glass mt-8 overflow-hidden rounded-3xl">
          <div className="flex items-center justify-between gap-4 border-b border-white/5 p-4 sm:p-6">
            <div role="tablist" className="flex gap-1 rounded-2xl bg-white/[0.03] p-1">
              {(["projects", "tickets"] as const).map((t) => (
                <button
                  key={t}
                  role="tab"
                  aria-selected={tab === t}
                  onClick={() => setTab(t)}
                  className={cn("relative rounded-xl px-4 py-2 font-display text-sm", tab === t ? "text-white" : "text-zinc-400 hover:text-white")}
                >
                  {tab === t && <motion.span layoutId="portal-tab" className="absolute inset-0 -z-10 rounded-xl bg-brand-gradient shadow-glow" />}
                  {t === "projects" ? (en ? "Projects" : "Projecten") : "Tickets"}
                </button>
              ))}
            </div>
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
              <LifeBuoy /> Support
            </Button>
          </div>

          <div className="overflow-x-auto">
            {tab === "projects" ? (
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-zinc-500">
                  <tr>
                    <Th>Project</Th><Th>{en ? "Department" : "Afdeling"}</Th><Th>Status</Th><Th>{en ? "Progress" : "Voortgang"}</Th><Th>Deadline</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {projects.map((p, i) => (
                    <motion.tr key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="transition-colors hover:bg-white/[0.02]">
                      <Td>
                        <p className="font-medium text-white">{p.name}</p>
                        <p className="text-xs text-zinc-500">{p.id}</p>
                      </Td>
                      <Td>{p.department}</Td>
                      <Td><Pill className={projectStatusStyle[p.status]}>{label(p.status)}</Pill></Td>
                      <Td>
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-32 overflow-hidden rounded-full bg-white/5">
                            <motion.div
                              className="h-full rounded-full bg-brand-gradient"
                              initial={{ width: 0 }}
                              animate={{ width: `${p.progress}%` }}
                              transition={{ duration: 1, delay: 0.2 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                            />
                          </div>
                          <span className="tabular-nums text-zinc-400">{p.progress}%</span>
                        </div>
                      </Td>
                      <Td>
                        <span className="inline-flex items-center gap-1.5 text-zinc-400">
                          <Clock className="size-3.5" />
                          {new Date(p.deadline).toLocaleDateString(en ? "en-GB" : "nl-NL", { day: "numeric", month: "short" })}
                        </span>
                      </Td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-zinc-500">
                  <tr>
                    <Th>Ticket</Th><Th>{en ? "Subject" : "Onderwerp"}</Th><Th>{en ? "Priority" : "Prioriteit"}</Th><Th>Status</Th><Th>{en ? "Last update" : "Laatste update"}</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {tickets.map((t, i) => (
                    <motion.tr key={t.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="transition-colors hover:bg-white/[0.02]">
                      <Td className="font-mono text-xs text-zinc-400">{t.id}</Td>
                      <Td className="font-medium text-white">{t.subject}</Td>
                      <Td className={priorityStyle[t.priority]}>{label(t.priority)}</Td>
                      <Td><Pill className={ticketStatusStyle[t.status]}>{label(t.status)}</Pill></Td>
                      <Td className="text-zinc-400">{t.updated}</Td>
                    </motion.tr>
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

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-6 py-4 font-medium">{children}</th>;
}
function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("px-6 py-4", className)}>{children}</td>;
}
function Pill({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-medium", className)}>{children}</span>;
}
