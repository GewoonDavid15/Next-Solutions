"use client";

import { Check, Copy, ExternalLink, Loader2, Save } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { ProfileCard } from "@/components/portal/ProfileCard";
import { Button } from "@/components/ui/Button";
import type { Profile } from "@/lib/profile";
import { cn } from "@/lib/utils";

const field = "w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-brand-500/60 focus:outline-none focus:ring-2 focus:ring-brand-500/30";
const COLORS = ["", "#C6F432", "#6E9BFF", "#FFB547", "#FF6B6B", "#B57BFF", "#3DD6C4"];
const SOCIALS = ["github", "x", "instagram", "youtube", "tiktok", "twitch"] as const;

const texts = {
  nl: {
    title: "Je profiel", intro: "Je naam, avatar, banner, decoratie en servertag komen live uit Discord. Pas ze aan in Discord en ze verschijnen hier vanzelf.",
    bioNote: "Discord deelt je bio niet met bots of websites, dus die schrijf je hier zelf.",
    handle: "Profielnaam", tagline: "Korte tekst onder je naam", bio: "Over mij", company: "Bedrijf of community", website: "Website", socials: "Socials (alleen je gebruikersnaam)",
    color: "Profielkleur", auto: "Automatisch", public: "Openbaar profiel", publicNote: "Iedereen kan je profiel bekijken op", save: "Opslaan", saved: "Opgeslagen!", copy: "Link kopiëren", copied: "Gekopieerd", preview: "Voorbeeld", badges: "Alle badges", earned: "behaald", open: "Bekijken",
  },
  en: {
    title: "Your profile", intro: "Your name, avatar, banner, decoration and server tag come live from Discord. Change them in Discord and they show up here.",
    bioNote: "Discord doesn't share your bio with bots or websites, so you write it here.",
    handle: "Profile name", tagline: "Short line under your name", bio: "About me", company: "Company or community", website: "Website", socials: "Socials (just your username)",
    color: "Profile colour", auto: "Automatic", public: "Public profile", publicNote: "Anyone can view your profile at", save: "Save", saved: "Saved!", copy: "Copy link", copied: "Copied", preview: "Preview", badges: "All badges", earned: "earned", open: "View",
  },
};

export function ProfileEditor({ initial }: { initial: Profile }) {
  const { locale } = useI18n();
  const tx = texts[locale];
  const [profile, setProfile] = useState(initial);
  const [form, setForm] = useState({
    handle: initial.handle ?? "", tagline: initial.tagline, bio: initial.bio, bedrijf: initial.bedrijf, website: initial.website,
    socials: { ...initial.socials } as Record<string, string>, kleur: initial.kleur ?? "", openbaar: initial.openbaar,
  });
  const [state, setState] = useState<"idle" | "busy" | "saved">("idle");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => { setForm((f) => ({ ...f, [k]: v })); setState("idle"); };

  const preview: Profile = { ...profile, handle: form.handle || null, tagline: form.tagline, bio: form.bio, bedrijf: form.bedrijf, website: form.website, socials: form.socials, kleur: form.kleur || null };
  const url = typeof window !== "undefined" && form.handle ? `${window.location.origin}/u/${form.handle}` : `/u/${form.handle}`;

  async function save() {
    setState("busy");
    setError("");
    const res = await fetch("/api/portaal/profiel", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ velden: { ...form, kleur: form.kleur || null } }),
    }).catch(() => null);
    const data = (await res?.json().catch(() => null)) as (Profile & { fout?: string }) | null;
    if (res?.ok && data?.id) {
      setProfile(data);
      setState("saved");
    } else {
      setError(data?.fout ?? "Opslaan mislukt.");
      setState("idle");
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-semibold">{tx.title}</h2>
          <p className="mt-1 text-sm text-zinc-400">{tx.intro}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block text-zinc-400">{tx.handle}</span>
            <div className="flex items-center rounded-2xl border border-white/10 bg-black/30 pl-4 focus-within:border-brand-500/60">
              <span className="text-sm text-zinc-500">/u/</span>
              <input value={form.handle} onChange={(e) => set("handle", e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 24))} className="w-full bg-transparent px-1 py-2.5 text-sm text-white focus:outline-none" />
            </div>
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-zinc-400">{tx.tagline}</span>
            <input value={form.tagline} onChange={(e) => set("tagline", e.target.value)} maxLength={80} className={field} />
          </label>
        </div>
        <label className="block text-sm">
          <span className="mb-1 block text-zinc-400">{tx.bio}</span>
          <textarea value={form.bio} onChange={(e) => set("bio", e.target.value)} rows={4} maxLength={400} className={field} />
          <span className="mt-1 flex justify-between text-[11px] text-zinc-500"><span>{tx.bioNote}</span><span>{form.bio.length}/400</span></span>
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block text-zinc-400">{tx.company}</span>
            <input value={form.bedrijf} onChange={(e) => set("bedrijf", e.target.value)} maxLength={80} className={field} />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-zinc-400">{tx.website}</span>
            <input value={form.website} onChange={(e) => set("website", e.target.value.trim())} placeholder="https://" className={field} />
          </label>
        </div>
        <div className="text-sm">
          <span className="mb-1 block text-zinc-400">{tx.socials}</span>
          <div className="grid gap-2 sm:grid-cols-3">
            {SOCIALS.map((s) => (
              <input key={s} value={form.socials[s] ?? ""} onChange={(e) => set("socials", { ...form.socials, [s]: e.target.value.replace(/^@/, "").trim() })} placeholder={s === "x" ? "X / Twitter" : s.charAt(0).toUpperCase() + s.slice(1)} maxLength={60} className={field} />
            ))}
          </div>
        </div>
        <div className="text-sm">
          <span className="mb-1 block text-zinc-400">{tx.color}</span>
          <div className="flex flex-wrap items-center gap-2">
            {COLORS.map((c) => (
              <button key={c || "auto"} type="button" onClick={() => set("kleur", c)} aria-label={c || tx.auto} title={c || tx.auto}
                className={cn("grid size-8 place-items-center rounded-full border-2 text-[10px]", form.kleur === c ? "border-white" : "border-transparent", !c && "bg-white/10 text-zinc-300")} style={c ? { background: c } : undefined}>
                {!c && "A"}
              </button>
            ))}
          </div>
        </div>
        <label className="flex items-start gap-3 rounded-2xl border border-white/10 p-4 text-sm">
          <input type="checkbox" checked={form.openbaar} onChange={(e) => set("openbaar", e.target.checked)} className="mt-0.5 accent-[#C6F432]" />
          <span>
            <span className="font-medium text-white">{tx.public}</span>
            <span className="mt-0.5 block text-zinc-400">{tx.publicNote} <span className="text-zinc-200">nextsolutionshq.nl/u/{form.handle || "…"}</span></span>
          </span>
        </label>
        {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
        <div className="flex flex-wrap gap-2">
          <Button onClick={save} disabled={state === "busy"}>
            {state === "busy" ? <Loader2 className="animate-spin" /> : state === "saved" ? <Check /> : <Save />} {state === "saved" ? tx.saved : tx.save}
          </Button>
          {profile.openbaar && profile.handle && (
            <>
              <Button variant="secondary" onClick={() => { navigator.clipboard?.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>
                {copied ? <Check /> : <Copy />} {copied ? tx.copied : tx.copy}
              </Button>
              <Button asChild variant="ghost"><a href={`/u/${profile.handle}`} target="_blank" rel="noreferrer"><ExternalLink /> {tx.open}</a></Button>
            </>
          )}
        </div>

        <div>
          <h3 className="mt-4 text-sm font-semibold uppercase tracking-wide text-zinc-400">{tx.badges}</h3>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {profile.badges.map((b) => (
              <li key={b.id} className={cn("flex items-center gap-3 rounded-2xl border p-3", b.behaald ? "border-brand-500/30 bg-brand-600/10" : "border-white/5 opacity-50")}>
                <span className="text-xl">{b.emoji}</span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-white">{b.naam} {b.behaald && <span className="text-xs text-brand-200">• {tx.earned}</span>}</span>
                  <span className="block truncate text-xs text-zinc-400">{b.uitleg}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="lg:sticky lg:top-28 lg:self-start">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">{tx.preview}</p>
        <ProfileCard profile={preview} locale={locale} />
      </div>
    </div>
  );
}
