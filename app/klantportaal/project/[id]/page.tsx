import { ArrowLeft, CalendarClock, CheckCircle2, Circle, Download, FolderOpen, History, MessageSquare } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { OnboardingChecklist } from "@/components/portal/OnboardingChecklist";
import { ProjectFeedback } from "@/components/portal/ProjectFeedback";
import { TicketChat } from "@/components/portal/TicketChat";
import { Button } from "@/components/ui/Button";
import { getClientData } from "@/lib/bot-api";
import { getI18n } from "@/lib/i18n/server";
import { formatDate, formatSize } from "@/lib/live";
import { getSession } from "@/lib/session";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Project", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const texts = {
  nl: { back: "Terug naar je portaal", milestones: "Mijlpalen", progress: "Voortgang", deadline: "Deadline", update: "Laatste update", history: "Geschiedenis", files: "Bestanden van dit project", noFiles: "Nog geen bestanden voor dit project.", chat: "Berichten met het team", chatNote: "Je project loopt via je ticket in Discord. Je kunt hier ook direct reageren.", done: "Opgeleverd 🎉", overdue: "verlopen" },
  en: { back: "Back to your portal", milestones: "Milestones", progress: "Progress", deadline: "Deadline", update: "Latest update", history: "History", files: "Files for this project", noFiles: "No files for this project yet.", chat: "Messages with the team", chatNote: "Your project runs through your ticket in Discord. You can reply here too.", done: "Delivered 🎉", overdue: "overdue" },
};

/** Project room: milestones, timeline, files, feedback and (when the project lives in a ticket) messages. */
export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, session, { locale, lp }] = await Promise.all([params, getSession(), getI18n()]);
  if (!session || session.demo) redirect(lp("/klantportaal"));
  if (!/^\d{17,20}$/.test(id)) notFound();
  const data = await getClientData(session.id);
  const p = data?.projecten.find((x) => x.id === id);
  if (!p) notFound();
  const tx = texts[locale];
  const date = (ms: number, time = false) => formatDate(ms, time, locale);
  const files = (data?.bestanden ?? []).filter((f) => f.project === p.naam);
  const inTicket = (data?.tickets ?? []).some((t) => t.id === id);
  const done = p.percentage >= 100 || p.fase === 4;
  const overdue = p.deadline !== null && !done && p.deadline < Date.now();

  return (
    <section className="pb-16 pt-32 sm:pt-36">
      <div className="container max-w-5xl">
        <Link href={`${lp("/klantportaal")}#projecten`} className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"><ArrowLeft className="size-4" /> {tx.back}</Link>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-brand-200">{p.faseEmoji} {p.faseNaam}</p>
            <h1 className="mt-1 text-4xl font-semibold">{p.naam}</h1>
          </div>
          {p.deadline !== null && (
            <span className={cn("inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm", overdue ? "border-rose-500/30 bg-rose-500/10 text-rose-200" : "border-white/10 text-zinc-300")}>
              <CalendarClock className="size-4" /> {tx.deadline}: {date(p.deadline)}{overdue ? ` (${tx.overdue})` : ""}
            </span>
          )}
        </div>

        <div className="glass mt-8 rounded-3xl p-6">
          <div className="flex items-center justify-between text-sm"><span className="text-zinc-400">{tx.progress}</span><span className="font-display text-2xl text-white">{done ? tx.done : `${p.percentage}%`}</span></div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full bg-brand-gradient" style={{ width: `${Math.min(100, Math.max(2, p.percentage))}%` }} /></div>

          <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-zinc-400">{tx.milestones}</h2>
          <ol className="mt-4 grid gap-4 sm:grid-cols-4">
            {p.fases.map((f) => {
              const state = f.nr < p.fase || done ? "done" : f.nr === p.fase ? "now" : "next";
              return (
                <li key={f.nr} className={cn("relative rounded-2xl border p-4", state === "done" ? "border-emerald-500/25 bg-emerald-500/5" : state === "now" ? "border-brand-500/50 bg-brand-600/15" : "border-white/10")}>
                  {state === "done" ? <CheckCircle2 className="size-5 text-emerald-300" /> : state === "now" ? <span className="text-lg">{f.emoji}</span> : <Circle className="size-5 text-zinc-600" />}
                  <p className={cn("mt-2 text-sm font-medium", state === "next" ? "text-zinc-500" : "text-white")}>{f.naam}</p>
                </li>
              );
            })}
          </ol>

          <div className="mt-8 rounded-2xl bg-white/[0.03] p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{tx.update}{p.bijgewerkt ? ` • ${date(p.bijgewerkt, true)}` : ""}</p>
            <p className="mt-1.5 whitespace-pre-line text-zinc-200">{p.notitie}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-8">
            {p.geschiedenis.length > 0 && (
              <div>
                <h2 className="flex items-center gap-2 text-xl font-semibold"><History className="size-5 text-brand-300" /> {tx.history}</h2>
                <ol className="mt-4 space-y-4 border-l border-white/10 pl-6">
                  {p.geschiedenis.map((g) => (
                    <li key={g.t} className="relative">
                      <span className="absolute -left-[31px] top-1 size-3 rounded-full border-2 border-ink bg-brand-400" />
                      <p className="text-xs text-zinc-500">{date(g.t, true)} • {g.faseNaam} • {g.percentage}%</p>
                      <p className="mt-0.5 text-sm text-zinc-200">{g.notitie}</p>
                    </li>
                  ))}
                </ol>
              </div>
            )}
            <div>
              <h2 className="flex items-center gap-2 text-xl font-semibold"><FolderOpen className="size-5 text-brand-300" /> {tx.files}</h2>
              {files.length === 0 ? <p className="mt-3 text-sm text-zinc-400">{tx.noFiles}</p> : (
                <ul className="mt-4 space-y-2">
                  {files.map((f) => (
                    <li key={f.id} className="glass flex items-center justify-between gap-4 rounded-2xl p-4">
                      <span className="min-w-0"><span className="block truncate font-medium text-white">{f.naam}</span><span className="text-xs text-zinc-500">{formatSize(f.grootte, locale)} • {date(f.t)}</span></span>
                      <Button asChild size="sm" variant="secondary"><a href={`/klantportaal/bestand/${f.id}`} download aria-label={f.naam}><Download /></a></Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {inTicket && (
              <div>
                <h2 className="flex items-center gap-2 text-xl font-semibold"><MessageSquare className="size-5 text-brand-300" /> {tx.chat}</h2>
                <p className="mt-1 text-sm text-zinc-400">{tx.chatNote}</p>
                <TicketChat ticketId={id} userId={session.id} />
              </div>
            )}
          </div>
          <div className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <OnboardingChecklist projectId={id} />
            {!done && <ProjectFeedback projectId={id} />}
          </div>
        </div>
      </div>
    </section>
  );
}
