import { AlertCircle, Bot, Briefcase, Bug, Download, FolderOpen, CalendarClock, CheckCircle2, ExternalLink, FileText, FolderKanban, LogOut, MessageSquare, Plus, Ticket } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FadeUp } from "@/components/motion/FadeUp";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { Button } from "@/components/ui/Button";
import { DiscordIcon } from "@/components/ui/DiscordIcon";
import { EmailSettings } from "@/components/portal/EmailSettings";
import { NewTicketForm } from "@/components/portal/NewTicketForm";
import { formatDate, formatSize, type ClientData, type ClientProject, type TicketDepartment } from "@/lib/live";
import { fmt, localePath, type Locale } from "@/lib/i18n/config";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

const texts = {
  nl: {
    active: "Actieve projecten", delivered: "Opgeleverd", openTickets: "Open tickets", openBugs: "Open bugmeldingen",
    welcome: "Welkom terug", newProject: "Nieuw project", logout: "Uitloggen",
    unavailable: "Je live gegevens zijn tijdelijk niet beschikbaar. Probeer het over een paar minuten opnieuw.",
    projects: "Projecten",
    noProjects: "Je hebt nog geen projecten bij ons. Zodra we aan de slag gaan, volg je de voortgang hier live.",
    requestProject: "Project aanvragen",
    files: "Bestanden", download: "{name} downloaden",
    noTickets: "Je hebt geen open tickets. Vragen? Open een ticket in onze Discord.", toDiscord: "Naar Discord",
    openedOn: "Geopend op {date}", helping: "{name} helpt je", waiting: "wacht op een medewerker", open: "Openen",
    applications: "Mijn sollicitaties", sentOn: "Verstuurd op {date}",
    closedTickets: "Afgesloten tickets", closedOn: "Gesloten op {date}", messages: "{n} berichten",
    bugs: "Bugmeldingen", noBugs: "Je hebt nog geen bugs gemeld. Iets gevonden? Meld het via het bugkanaal in onze Discord.",
    reportedOn: "Gemeld op {date}",
    phases: "Projectfases", lastUpdate: "Laatste update", earlier: "Eerdere updates",
  },
  en: {
    active: "Active projects", delivered: "Delivered", openTickets: "Open tickets", openBugs: "Open bug reports",
    welcome: "Welcome back", newProject: "New project", logout: "Log out",
    unavailable: "Your live data is temporarily unavailable. Please try again in a few minutes.",
    projects: "Projects",
    noProjects: "You don't have any projects with us yet. As soon as we get started, you can follow the progress here live.",
    requestProject: "Request a project",
    files: "Files", download: "Download {name}",
    noTickets: "You have no open tickets. Questions? Open a ticket in our Discord.", toDiscord: "Go to Discord",
    openedOn: "Opened on {date}", helping: "{name} is helping you", waiting: "waiting for a team member", open: "Open",
    applications: "My applications", sentOn: "Sent on {date}",
    closedTickets: "Closed tickets", closedOn: "Closed on {date}", messages: "{n} messages",
    bugs: "Bug reports", noBugs: "You haven't reported any bugs yet. Found something? Report it in the bug channel in our Discord.",
    reportedOn: "Reported on {date}",
    phases: "Project phases", lastUpdate: "Last update", earlier: "Earlier updates",
  },
};

type Texts = (typeof texts)["nl"];

interface ClientPortalProps {
  locale?: Locale;
  user: { name: string; avatar: string | null };
  /** null when the bot could not be reached */
  data: ClientData | null;
  isOwner: boolean;
  departments: TicketDepartment[];
}

/** Client portal with live data from the Discord bot: projects (/projectstatus), tickets and bug reports. */
export function ClientPortal({ user, data, isOwner, departments, locale = "nl" }: ClientPortalProps) {
  const tx = texts[locale];
  const lp = (href: string) => localePath(locale, href);
  const date = (ms: number, withTime = false) => formatDate(ms, withTime, locale);
  const projects = data?.projecten ?? [];
  const tickets = data?.tickets ?? [];
  const bugs = data?.bugs ?? [];
  const transcripts = data?.transcripts ?? [];
  const applications = data?.sollicitaties ?? [];
  const files = data?.bestanden ?? [];

  const kpis = [
    { label: tx.active, value: projects.filter((p) => p.percentage < 100).length, icon: FolderKanban },
    { label: tx.delivered, value: projects.filter((p) => p.percentage >= 100).length, icon: CheckCircle2 },
    { label: tx.openTickets, value: tickets.length, icon: Ticket },
    { label: tx.openBugs, value: bugs.filter((b) => !b.afgesloten).length, icon: Bug },
  ];

  return (
    <section className="pb-16 pt-32 sm:pt-36">
      <div className="container">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {user.avatar ? (
              <Image src={user.avatar} alt="" width={56} height={56} className="size-14 rounded-2xl border border-white/10" />
            ) : (
              <span className="grid size-14 place-items-center rounded-2xl bg-brand-gradient font-display text-xl font-semibold text-white">{user.name.charAt(0).toUpperCase()}</span>
            )}
            <div>
              <p className="text-sm text-zinc-400">{tx.welcome}</p>
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
              <Link href={lp("/contact")}><Plus /> {tx.newProject}</Link>
            </Button>
            <form action={locale === "en" ? "/api/auth/logout?taal=en" : "/api/auth/logout"} method="post">
              <Button type="submit" variant="secondary" size="sm"><LogOut /> {tx.logout}</Button>
            </form>
          </div>
        </div>

        {!data && (
          <p role="status" className="mt-8 flex items-start gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
            <AlertCircle className="mt-0.5 size-4 shrink-0" /> {tx.unavailable}
          </p>
        )}

        <Stagger className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {kpis.map(({ label, value, icon: Icon }) => (
            <StaggerItem key={label} className="glass flex items-center gap-4 rounded-3xl p-5">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-600/15 text-brand-300">
                <Icon className="size-5" />
              </span>
              <div>
                <p className="font-display text-2xl font-semibold text-white">{value}</p>
                <p className="text-xs text-zinc-400 sm:text-sm">{label}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        {/* Projects */}
        <h2 className="mt-12 flex items-center gap-2 text-xl font-semibold"><FolderKanban className="size-5 text-brand-300" /> {tx.projects}</h2>
        {projects.length === 0 ? (
          <Empty text={tx.noProjects} cta={{ href: lp("/contact"), label: tx.requestProject }} />
        ) : (
          <div className="mt-4 grid gap-6 lg:grid-cols-2">
            {projects.map((p, i) => (
              <FadeUp key={p.id} delay={i * 0.05}>
                <ProjectCard project={p} tx={tx} date={date} />
              </FadeUp>
            ))}
          </div>
        )}

        {/* Files */}
        {files.length > 0 && (
          <>
            <h2 className="mt-12 flex items-center gap-2 text-xl font-semibold"><FolderOpen className="size-5 text-brand-300" /> {tx.files}</h2>
            <ul className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {files.map((f) => (
                <li key={f.id} className="glass flex items-center justify-between gap-4 rounded-3xl p-5">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-white" title={f.naam}>{f.naam}</p>
                    <p className="mt-0.5 truncate text-sm text-zinc-400">
                      {formatSize(f.grootte, locale)} • {date(f.t)}{f.project ? ` • ${f.project}` : ""}
                    </p>
                    {f.beschrijving && <p className="mt-1 truncate text-xs text-zinc-500">{f.beschrijving}</p>}
                  </div>
                  <Button asChild size="sm" variant="secondary">
                    <a href={`/klantportaal/bestand/${f.id}`} download aria-label={fmt(tx.download, { name: f.naam })}><Download /></a>
                  </Button>
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {/* Tickets */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-xl font-semibold"><Ticket className="size-5 text-brand-300" /> {tx.openTickets}</h2>
              {departments.length > 0 && <NewTicketForm departments={departments} discordInvite={site.discordInvite} />}
            </div>
            {tickets.length === 0 ? (
              <Empty text={tx.noTickets} cta={{ href: site.discordInvite, label: tx.toDiscord, external: true }} />
            ) : (
              <ul className="mt-4 space-y-3">
                {tickets.map((t) => (
                  <li key={t.id} className="glass flex items-center justify-between gap-4 rounded-3xl p-5">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-white">{t.emoji} {t.afdeling}</p>
                      <p className="mt-0.5 text-sm text-zinc-400">
                        {fmt(tx.openedOn, { date: date(t.geopend, true) })} • {t.geclaimdDoor ? <span className="text-emerald-300">{fmt(tx.helping, { name: t.geclaimdDoor })}</span> : <span className="text-amber-300">{tx.waiting}</span>}
                      </p>
                    </div>
                    <Button asChild size="sm" variant="discord">
                      <a href={t.link} target="_blank" rel="noopener noreferrer"><DiscordIcon className="size-4" /> {tx.open}</a>
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Applications */}
          {applications.length > 0 && (
            <div className="lg:col-span-2 lg:order-last">
              <h2 className="flex items-center gap-2 text-xl font-semibold"><Briefcase className="size-5 text-brand-300" /> {tx.applications}</h2>
              <ul className="mt-4 grid gap-3 md:grid-cols-2">
                {applications.map((a) => (
                  <li key={a.id} className="glass flex items-center justify-between gap-4 rounded-3xl p-5">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-white">{a.titel}</p>
                      <p className="mt-0.5 text-sm text-zinc-400">{fmt(tx.sentOn, { date: date(a.t) })}</p>
                    </div>
                    <span className={cn("shrink-0 rounded-full border px-2.5 py-1 text-xs", a.afgesloten ? "border-white/10 bg-white/5 text-zinc-300" : "border-brand-500/30 bg-brand-600/10 text-brand-200")}>
                      {a.statusEmoji} {a.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Closed tickets with transcript */}
          {transcripts.length > 0 && (
            <div className="lg:col-span-2 lg:order-last">
              <h2 className="flex items-center gap-2 text-xl font-semibold"><FileText className="size-5 text-brand-300" /> {tx.closedTickets}</h2>
              <ul className="mt-4 grid gap-3 md:grid-cols-2">
                {transcripts.map((t) => (
                  <li key={t.id} className="glass flex items-center justify-between gap-4 rounded-3xl p-5">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-white">{t.emoji} {t.afdeling}</p>
                      <p className="mt-0.5 text-sm text-zinc-400">
                        {fmt(tx.closedOn, { date: date(t.gesloten, true) })} • {fmt(tx.messages, { n: t.berichten })}
                      </p>
                    </div>
                    <Button asChild size="sm" variant="secondary">
                      <a href={`/klantportaal/transcript/${t.id}`} target="_blank" rel="noopener noreferrer"><FileText /> Transcript</a>
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Bug reports */}
          <div>
            <h2 className="flex items-center gap-2 text-xl font-semibold"><Bug className="size-5 text-brand-300" /> {tx.bugs}</h2>
            {bugs.length === 0 ? (
              <Empty text={tx.noBugs} />
            ) : (
              <ul className="mt-4 space-y-3">
                {bugs.map((b) => (
                  <li key={b.nr} className="glass rounded-3xl p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium text-white">
                        <span className="font-mono text-xs text-zinc-500">#{String(b.nr).padStart(4, "0")}</span> {b.titel}
                      </p>
                      <span className={cn("rounded-full border px-2.5 py-1 text-xs", b.afgesloten ? "border-white/10 bg-white/5 text-zinc-300" : "border-amber-500/30 bg-amber-500/10 text-amber-200")}>
                        {b.statusEmoji} {b.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">{fmt(tx.reportedOn, { date: date(b.aangemaakt) })}</p>
                    {b.reactie && (
                      <p className="mt-3 flex items-start gap-2 rounded-2xl bg-white/[0.03] p-3 text-sm text-zinc-300">
                        <MessageSquare className="mt-0.5 size-4 shrink-0 text-brand-300" /> {b.reactie}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {data?.email?.beschikbaar && (
          <div className="mt-12 max-w-2xl">
            <EmailSettings initial={data.email} />
          </div>
        )}
      </div>
    </section>
  );
}

function ProjectCard({ project: p, tx, date }: { project: ClientProject; tx: Texts; date: (ms: number, withTime?: boolean) => string }) {
  const overdue = p.deadline !== null && p.percentage < 100 && p.deadline < Date.now();
  return (
    <div className="glass h-full rounded-3xl p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-xl text-white">{p.naam}</p>
          <p className="mt-1 text-sm text-brand-200">{p.faseEmoji} {p.faseNaam}</p>
        </div>
        {p.deadline !== null && (
          <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs", overdue ? "border-rose-500/30 bg-rose-500/10 text-rose-200" : "border-white/10 text-zinc-300")}>
            <CalendarClock className="size-3.5" /> {date(p.deadline)}
          </span>
        )}
      </div>

      <div className="mt-5 flex items-center gap-3">
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/5">
          <div className="h-full rounded-full bg-brand-gradient" style={{ width: `${Math.min(100, Math.max(0, p.percentage))}%` }} />
        </div>
        <span className="font-display tabular-nums text-white">{p.percentage}%</span>
      </div>

      <ol className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label={tx.phases}>
        {p.fases.map((f) => (
          <li
            key={f.nr}
            className={cn(
              "rounded-xl border px-2.5 py-2 text-xs",
              f.nr < p.fase || p.percentage >= 100
                ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-200"
                : f.nr === p.fase
                  ? "border-brand-500/50 bg-brand-600/15 text-white"
                  : "border-white/10 text-zinc-500",
            )}
          >
            <span aria-hidden>{f.nr < p.fase || p.percentage >= 100 ? "✅" : f.emoji}</span> {f.naam}
          </li>
        ))}
      </ol>

      <div className="mt-5 rounded-2xl bg-white/[0.03] p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{tx.lastUpdate}{p.bijgewerkt ? ` • ${date(p.bijgewerkt, true)}` : ""}</p>
        <p className="mt-1.5 whitespace-pre-line text-sm text-zinc-300">{p.notitie}</p>
      </div>

      {p.geschiedenis.length > 1 && (
        <details className="mt-4 text-sm">
          <summary className="cursor-pointer text-zinc-400 hover:text-white">{tx.earlier}</summary>
          <ul className="mt-2 space-y-1.5 border-l border-white/10 pl-4">
            {p.geschiedenis.slice(1).map((g) => (
              <li key={g.t} className="text-zinc-400">
                <span className="text-zinc-500">{date(g.t)} • {g.percentage}%</span> — {g.notitie}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

function Empty({ text, cta }: { text: string; cta?: { href: string; label: string; external?: boolean } }) {
  return (
    <div className="glass mt-4 rounded-3xl p-6 text-sm text-zinc-400">
      <p>{text}</p>
      {cta && (
        <Button asChild size="sm" variant="secondary" className="mt-4">
          {cta.external ? (
            <a href={cta.href} target="_blank" rel="noopener noreferrer"><ExternalLink /> {cta.label}</a>
          ) : (
            <Link href={cta.href}>{cta.label}</Link>
          )}
        </Button>
      )}
    </div>
  );
}
