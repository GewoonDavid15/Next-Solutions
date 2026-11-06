"use client";

import { BarChart3, CalendarDays, Check, CreditCard, Download, ExternalLink, FileUp, Link2, Loader2, Pencil, Receipt, Upload } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { Button } from "@/components/ui/Button";
import { STATUS_LABEL, TYPE_LABEL, fmtNumber, type ClientSocial, type SocialPost, type SocialReport } from "@/lib/social";
import { cn } from "@/lib/utils";

const texts = {
  nl: {
    title: "Social media", tabs: { kalender: "Contentkalender", rapporten: "Rapporten", aanleveren: "Content aanleveren", abonnement: "Abonnement" },
    empty: "Hier verschijnt alles van je social media zodra we voor je aan de slag gaan. Interesse?", emptyCta: "Bekijk social media",
    toApprove: "Wacht op jouw goedkeuring", approve: "Goedkeuren", change: "Aanpassing vragen", what: "Wat moet er anders?", send: "Versturen",
    noPosts: "Er staat nog geen content in je kalender.", caption: "Tekst", media: "Bekijk beeld", feedback: "Jouw feedback",
    noReports: "Je eerste maandrapport verschijnt hier aan het eind van de maand.", followers: "Volgers", growth: "Groei", reach: "Bereik", views: "Weergaven", interactions: "Interacties", posts: "Posts",
    highlights: "Hoogtepunten", advice: "Advies voor volgende maand", pdf: "Download PDF", trend: "Volgers per maand", vsPrev: "t.o.v. vorige maand",
    uploadTitle: "Lever foto's, video's of bestanden aan", uploadIntro: "Bestanden tot {mb} MB kun je hier uploaden. Grotere video's deel je via een link (Google Drive, WeTransfer, Dropbox).",
    file: "Bestand", or: "of", link: "Link naar je bestanden", note: "Toelichting (optioneel)", upload: "Versturen", uploaded: "Ontvangen! Het team heeft je content.", yourUploads: "Aangeleverd",
    noSub: "Je hebt (nog) geen social media abonnement.", status: { actief: "Actief", gepauzeerd: "Gepauzeerd", gestopt: "Gestopt" } as Record<string, string>,
    next: "Volgende betaling", since: "Sinds", platforms: "Platformen", history: "Betalingen", receipt: "Betaalbewijs", pay: "Betalen", failed: "Er ging iets mis.",
  },
  en: {
    title: "Social media", tabs: { kalender: "Content calendar", rapporten: "Reports", aanleveren: "Deliver content", abonnement: "Subscription" },
    empty: "Everything about your social media shows up here once we start working for you. Interested?", emptyCta: "View social media",
    toApprove: "Waiting for your approval", approve: "Approve", change: "Request change", what: "What should change?", send: "Send",
    noPosts: "There's no content in your calendar yet.", caption: "Caption", media: "View media", feedback: "Your feedback",
    noReports: "Your first monthly report will appear here at the end of the month.", followers: "Followers", growth: "Growth", reach: "Reach", views: "Views", interactions: "Interactions", posts: "Posts",
    highlights: "Highlights", advice: "Advice for next month", pdf: "Download PDF", trend: "Followers per month", vsPrev: "vs last month",
    uploadTitle: "Deliver photos, videos or files", uploadIntro: "You can upload files up to {mb} MB here. Share bigger videos through a link (Google Drive, WeTransfer, Dropbox).",
    file: "File", or: "or", link: "Link to your files", note: "Note (optional)", upload: "Send", uploaded: "Received! The team has your content.", yourUploads: "Delivered",
    noSub: "You don't have a social media subscription (yet).", status: { actief: "Active", gepauzeerd: "Paused", gestopt: "Stopped" } as Record<string, string>,
    next: "Next payment", since: "Since", platforms: "Platforms", history: "Payments", receipt: "Receipt", pay: "Payment", failed: "Something went wrong.",
  },
};

type Tab = "kalender" | "rapporten" | "aanleveren" | "abonnement";

function PostCard({ post, onDone, locale }: { post: SocialPost; onDone: (p: SocialPost) => void; locale: "nl" | "en" }) {
  const tx = texts[locale];
  const [mode, setMode] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const canReview = ["ter-goedkeuring", "aanpassing", "goedgekeurd"].includes(post.status);

  async function decide(besluit: "goedgekeurd" | "aanpassing") {
    setBusy(true); setError("");
    const res = await fetch("/api/portaal/social", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: post.id, besluit, feedback: text }) }).catch(() => null);
    const json = (await res?.json().catch(() => null)) as (SocialPost & { fout?: string }) | null;
    if (res?.ok && json?.id) { onDone(json); setMode(false); setText(""); } else setError(json?.fout ?? tx.failed);
    setBusy(false);
  }

  const st = STATUS_LABEL[post.status];
  return (
    <div className={cn("glass rounded-3xl p-5", post.status === "ter-goedkeuring" && "border-amber-400/40")}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-zinc-500">{new Date(post.datum).toLocaleString(locale === "en" ? "en-GB" : "nl-NL", { timeZone: "Europe/Amsterdam", weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} • {post.platform} • {TYPE_LABEL[post.type]?.[locale] ?? post.type}</p>
          <p className="mt-1 font-semibold text-white">{post.titel}</p>
        </div>
        <span className={cn("shrink-0 rounded-full border px-2.5 py-0.5 text-xs", st.cls)}>{st[locale]}</span>
      </div>
      {post.caption && <p className="mt-3 whitespace-pre-line rounded-2xl bg-black/20 p-3 text-sm text-zinc-300">{post.caption}</p>}
      {post.media.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {post.media.map((m, i) => <a key={m} href={m} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-brand-300 hover:underline"><ExternalLink className="size-3.5" /> {tx.media} {post.media.length > 1 ? i + 1 : ""}</a>)}
        </div>
      )}
      {post.feedback.length > 0 && (
        <p className="mt-3 text-xs text-zinc-500">{tx.feedback}: “{post.feedback[post.feedback.length - 1].tekst || STATUS_LABEL[post.feedback[post.feedback.length - 1].besluit as SocialPost["status"]]?.[locale]}”</p>
      )}
      {canReview && (
        <div className="mt-4">
          {mode ? (
            <div className="space-y-2">
              <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} maxLength={1000} placeholder={tx.what} className="w-full rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-sm" />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => decide("aanpassing")} disabled={busy || text.trim().length < 3}>{busy && <Loader2 className="animate-spin" />} {tx.send}</Button>
                <Button size="sm" variant="ghost" onClick={() => setMode(false)}>×</Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {post.status !== "goedgekeurd" && <Button size="sm" onClick={() => decide("goedgekeurd")} disabled={busy}>{busy ? <Loader2 className="animate-spin" /> : <Check />} {tx.approve}</Button>}
              <Button size="sm" variant="secondary" onClick={() => setMode(true)} disabled={busy}><Pencil /> {tx.change}</Button>
            </div>
          )}
          {error && <p role="alert" className="mt-2 text-sm text-rose-300">{error}</p>}
        </div>
      )}
    </div>
  );
}

function ReportView({ report, all, locale }: { report: SocialReport; all: SocialReport[]; locale: "nl" | "en" }) {
  const tx = texts[locale];
  const prev = all.find((r) => r.maand < report.maand);
  const maxReach = Math.max(1, ...report.platformen.map((p) => p.bereik ?? 0));
  const months = [...all].sort((a, b) => a.maand.localeCompare(b.maand)).slice(-6);
  const trendMax = Math.max(1, ...months.flatMap((m) => m.platformen.map((p) => p.volgers ?? 0)));
  const COLORS = ["#C6F432", "#6E9BFF", "#FFB547", "#FF6B6B", "#B57BFF", "#3DD6C4"];
  const platforms = [...new Set(months.flatMap((m) => m.platformen.map((p) => p.platform)))];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {report.platformen.map((p) => {
          const old = prev?.platformen.find((x) => x.platform === p.platform);
          const growth = p.volgers !== null && old?.volgers != null ? p.volgers - old.volgers : p.groei;
          return (
            <div key={p.platform} className="glass rounded-3xl p-5">
              <p className="text-sm font-semibold text-white">{p.platform}</p>
              <p className="mt-3 font-display text-3xl text-white">{fmtNumber(p.volgers, locale)}</p>
              <p className="text-xs text-zinc-500">{tx.followers}{growth !== null && growth !== undefined && <span className={cn("ml-2 font-semibold", growth >= 0 ? "text-emerald-300" : "text-rose-300")}>{growth >= 0 ? "+" : ""}{fmtNumber(growth, locale)} {tx.vsPrev}</span>}</p>
              <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
                {[[tx.reach, p.bereik], [tx.views, p.weergaven], [tx.interactions, p.interacties], [tx.posts, p.posts]].map(([l, v]) => (
                  <div key={l as string}><dt className="text-xs text-zinc-500">{l}</dt><dd className="text-zinc-200">{fmtNumber(v as number | null, locale)}</dd></div>
                ))}
              </dl>
            </div>
          );
        })}
      </div>

      {report.platformen.some((p) => p.bereik) && (
        <div className="glass rounded-3xl p-5">
          <p className="text-sm font-semibold text-white">{tx.reach}</p>
          <div className="mt-4 space-y-2">
            {report.platformen.filter((p) => p.bereik).map((p) => (
              <div key={p.platform} className="flex items-center gap-3 text-sm">
                <span className="w-20 shrink-0 text-zinc-400">{p.platform}</span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full bg-brand-gradient" style={{ width: `${((p.bereik ?? 0) / maxReach) * 100}%` }} /></div>
                <span className="w-20 shrink-0 text-right tabular-nums text-zinc-200">{fmtNumber(p.bereik, locale)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {months.length > 1 && (
        <div className="glass rounded-3xl p-5">
          <p className="text-sm font-semibold text-white">{tx.trend}</p>
          <div className="mt-4 flex h-40 items-end gap-3">
            {months.map((m) => (
              <div key={m.maand} className="flex h-full flex-1 flex-col justify-end">
                <div className="flex h-full items-end justify-center gap-0.5">
                  {platforms.map((pl, i) => {
                    const v = m.platformen.find((x) => x.platform === pl)?.volgers ?? 0;
                    return <div key={pl} title={`${pl}: ${fmtNumber(v, locale)}`} className="w-full max-w-4 rounded-t" style={{ height: `${(v / trendMax) * 100}%`, background: COLORS[i % COLORS.length], minHeight: v ? 2 : 0 }} />;
                  })}
                </div>
                <p className="mt-1 truncate text-center text-[10px] text-zinc-500">{m.maandNaam}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-zinc-400">
            {platforms.map((pl, i) => <span key={pl} className="flex items-center gap-1.5"><span className="size-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />{pl}</span>)}
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {report.hoogtepunten && <div className="glass rounded-3xl p-5"><p className="text-sm font-semibold text-white">{tx.highlights}</p><p className="mt-2 whitespace-pre-line text-sm text-zinc-300">{report.hoogtepunten}</p></div>}
        {report.advies && <div className="glass rounded-3xl p-5"><p className="text-sm font-semibold text-white">{tx.advice}</p><p className="mt-2 whitespace-pre-line text-sm text-zinc-300">{report.advies}</p></div>}
      </div>
      <Button asChild variant="secondary" size="sm"><a href={`/api/portaal/social/bestand?soort=rapport&id=${report.id}`}><Download /> {tx.pdf}</a></Button>
    </div>
  );
}

function UploadForm({ maxMb, onDone, locale }: { maxMb: number; onDone: () => void; locale: "nl" | "en" }) {
  const tx = texts[locale];
  const [file, setFile] = useState<File | null>(null);
  const [link, setLink] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (file && file.size > maxMb * 1024 * 1024) return setMsg({ ok: false, text: tx.uploadIntro.replace("{mb}", String(maxMb)) });
    setBusy(true); setMsg(null);
    const form = new FormData();
    if (file) form.append("bestand", file);
    if (link) form.append("link", link);
    form.append("notitie", note);
    const res = await fetch("/api/portaal/social/upload", { method: "POST", body: form }).catch(() => null);
    const json = (await res?.json().catch(() => null)) as { fout?: string } | null;
    if (res?.ok) { setMsg({ ok: true, text: tx.uploaded }); setFile(null); setLink(""); setNote(""); (e.target as HTMLFormElement).reset(); onDone(); } else setMsg({ ok: false, text: json?.fout ?? tx.failed });
    setBusy(false);
  }

  return (
    <form onSubmit={send} className="glass space-y-4 rounded-3xl p-6">
      <div>
        <h3 className="flex items-center gap-2 font-semibold"><FileUp className="size-5 text-brand-300" /> {tx.uploadTitle}</h3>
        <p className="mt-1 text-sm text-zinc-400">{tx.uploadIntro.replace("{mb}", String(maxMb))}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
        <label className="text-sm">
          <span className="mb-1 block text-zinc-400">{tx.file}</span>
          <input type="file" accept="image/*,video/mp4,video/quicktime,video/webm,application/pdf,application/zip" onChange={(e) => { setFile(e.target.files?.[0] ?? null); setLink(""); }}
            className="block w-full text-sm text-zinc-300 file:mr-3 file:rounded-xl file:border-0 file:bg-brand-600/20 file:px-3 file:py-2 file:text-sm file:text-brand-100" />
        </label>
        <span className="text-center text-xs text-zinc-500">{tx.or}</span>
        <label className="text-sm">
          <span className="mb-1 block text-zinc-400">{tx.link}</span>
          <input value={link} onChange={(e) => { setLink(e.target.value.trim()); }} disabled={Boolean(file)} placeholder="https://" className="w-full rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-sm disabled:opacity-40" />
        </label>
      </div>
      <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} maxLength={500} placeholder={tx.note} className="w-full rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-sm" />
      {msg && <p role={msg.ok ? "status" : "alert"} className={cn("text-sm", msg.ok ? "text-emerald-300" : "text-rose-300")}>{msg.text}</p>}
      <Button type="submit" disabled={busy || (!file && !link)}>{busy ? <Loader2 className="animate-spin" /> : <Upload />} {tx.upload}</Button>
    </form>
  );
}

export function SocialPanel() {
  const { locale, lp } = useI18n();
  const tx = texts[locale];
  const [data, setData] = useState<ClientSocial | null>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("kalender");
  const [reportId, setReportId] = useState<string | null>(null);
  const date = (t: number) => new Date(t).toLocaleDateString(locale === "en" ? "en-GB" : "nl-NL", { day: "numeric", month: "long", year: "numeric" });

  const load = useCallback(async () => {
    const res = await fetch("/api/portaal/social", { cache: "no-store" }).catch(() => null);
    const json = (await res?.json().catch(() => null)) as (ClientSocial & { fout?: string }) | null;
    if (res?.ok && json?.posts) setData(json); else setError(json?.fout ?? tx.failed);
  }, [tx.failed]);
  useEffect(() => { load(); }, [load]);

  const toApprove = useMemo(() => data?.posts.filter((p) => p.status === "ter-goedkeuring") ?? [], [data]);
  const upcoming = useMemo(() => data?.posts.filter((p) => p.status !== "ter-goedkeuring") ?? [], [data]);
  const updatePost = (p: SocialPost) => setData((d) => (d ? { ...d, posts: d.posts.map((x) => (x.id === p.id ? p : x)) } : d));

  if (!data && !error) return <Loader2 className="size-5 animate-spin text-zinc-500" />;
  if (error) return <p role="alert" className="text-sm text-rose-300">{error}</p>;
  if (!data) return null;
  const isEmpty = !data.posts.length && !data.rapporten.length && !data.uploads.length && !data.abonnement;
  const report = data.rapporten.find((r) => r.id === reportId) ?? data.rapporten[0];

  const subTabs: { id: Tab; icon: typeof CalendarDays; badge?: number }[] = [
    { id: "kalender", icon: CalendarDays, badge: toApprove.length || undefined },
    { id: "rapporten", icon: BarChart3 },
    { id: "aanleveren", icon: FileUp },
    { id: "abonnement", icon: CreditCard },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">{tx.title}</h2>
      {isEmpty && (
        <div className="glass rounded-3xl p-6 text-sm text-zinc-400">
          <p>{tx.empty}</p>
          <Button asChild size="sm" variant="secondary" className="mt-4"><Link href={lp("/social-media")}>{tx.emptyCta}</Link></Button>
        </div>
      )}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {subTabs.map(({ id, icon: Icon, badge }) => (
          <button key={id} type="button" onClick={() => setTab(id)} className={cn("inline-flex shrink-0 items-center gap-2 rounded-2xl border px-4 py-2 text-sm", tab === id ? "border-brand-500/50 bg-brand-600/20 text-white" : "border-white/10 text-zinc-400 hover:text-white")}>
            <Icon className="size-4" /> {tx.tabs[id]} {badge ? <span className="rounded-full bg-amber-400/20 px-1.5 text-[11px] text-amber-200">{badge}</span> : null}
          </button>
        ))}
      </div>

      {tab === "kalender" && (
        <div className="space-y-6">
          {toApprove.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-amber-200">{tx.toApprove} ({toApprove.length})</h3>
              <div className="grid gap-4 lg:grid-cols-2">{toApprove.map((p) => <PostCard key={p.id} post={p} onDone={updatePost} locale={locale} />)}</div>
            </div>
          )}
          {upcoming.length > 0 ? <div className="grid gap-4 lg:grid-cols-2">{upcoming.map((p) => <PostCard key={p.id} post={p} onDone={updatePost} locale={locale} />)}</div>
            : !toApprove.length && <p className="text-sm text-zinc-400">{tx.noPosts}</p>}
        </div>
      )}

      {tab === "rapporten" && (
        report ? (
          <div className="space-y-4">
            {data.rapporten.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {data.rapporten.map((r) => <button key={r.id} type="button" onClick={() => setReportId(r.id)} className={cn("rounded-full border px-3 py-1 text-sm capitalize", r.id === report.id ? "border-brand-500/60 bg-brand-600/20 text-white" : "border-white/10 text-zinc-400")}>{r.maandNaam}</button>)}
              </div>
            )}
            <h3 className="text-lg font-semibold capitalize">{report.maandNaam}</h3>
            <ReportView report={report} all={data.rapporten} locale={locale} />
          </div>
        ) : <p className="text-sm text-zinc-400">{tx.noReports}</p>
      )}

      {tab === "aanleveren" && (
        <div className="space-y-6">
          <UploadForm maxMb={data.maxUploadMb} onDone={load} locale={locale} />
          {data.uploads.length > 0 && (
            <div>
              <h3 className="font-semibold">{tx.yourUploads}</h3>
              <ul className="mt-3 space-y-2">
                {data.uploads.map((u) => (
                  <li key={u.id} className="glass flex items-center justify-between gap-3 rounded-2xl p-4">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-white">{u.soort === "link" ? <Link2 className="mr-1 inline size-4" /> : null}{u.naam}</span>
                      <span className="block truncate text-xs text-zinc-500">{date(u.t)}{u.grootte ? ` • ${(u.grootte / 1024 / 1024).toFixed(1)} MB` : ""}{u.notitie ? ` • ${u.notitie}` : ""}</span>
                    </span>
                    <a href={`/api/portaal/social/bestand?soort=upload&id=${u.id}`} target="_blank" rel="noopener noreferrer" className="rounded-xl p-2 text-zinc-400 hover:bg-white/5 hover:text-white" aria-label={u.naam}><ExternalLink className="size-4" /></a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {tab === "abonnement" && (
        data.abonnement ? (
          <div className="space-y-6">
            <div className="glass rounded-3xl p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-2xl text-white">{data.abonnement.pakket}</p>
                  <p className="mt-1 text-sm text-zinc-400">{data.abonnement.prijs} • {tx.since} {date(data.abonnement.start)}</p>
                </div>
                <span className={cn("rounded-full border px-2.5 py-1 text-xs", data.abonnement.status === "actief" ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200" : "border-white/10 text-zinc-400")}>{tx.status[data.abonnement.status]}</span>
              </div>
              <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                {data.abonnement.status === "actief" && <div><dt className="text-xs text-zinc-500">{tx.next}</dt><dd className="text-white">{date(data.abonnement.volgendeBetaling)}</dd></div>}
                {data.abonnement.platformen.length > 0 && <div><dt className="text-xs text-zinc-500">{tx.platforms}</dt><dd className="text-white">{data.abonnement.platformen.join(", ")}</dd></div>}
              </dl>
              {data.abonnement.betaalinstructie && (
                <div className="mt-5 rounded-2xl border border-amber-400/25 bg-amber-400/[0.06] p-3 text-sm"><p className="font-medium text-amber-100">{tx.pay}</p><p className="mt-1 text-zinc-300">{data.abonnement.betaalinstructie}</p></div>
              )}
            </div>
            {data.abonnement.betalingen.length > 0 && (
              <div>
                <h3 className="font-semibold">{tx.history}</h3>
                <ul className="mt-3 space-y-2">
                  {data.abonnement.betalingen.map((b) => (
                    <li key={b.nr} className="glass flex items-center justify-between gap-3 rounded-2xl p-4 text-sm">
                      <span><span className="font-medium capitalize text-white">{b.periode}</span><span className="ml-2 text-zinc-500">{b.bedrag} • {date(b.t)}</span></span>
                      <a href={`/api/portaal/social/bestand?soort=bon&nr=${b.nr}`} className="inline-flex items-center gap-1.5 text-brand-300 hover:text-white"><Receipt className="size-4" /> {tx.receipt}</a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : <p className="text-sm text-zinc-400">{tx.noSub}</p>
      )}
    </div>
  );
}
