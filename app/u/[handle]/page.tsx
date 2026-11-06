import { ArrowRight, Rocket, Star } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProfileCard } from "@/components/portal/ProfileCard";
import { Button } from "@/components/ui/Button";
import { getPublicProfile } from "@/lib/bot-api";
import { getI18n } from "@/lib/i18n/server";
import { site } from "@/lib/site";

export const revalidate = 120;

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params;
  const p = await getPublicProfile(handle.toLowerCase());
  if (!p) return { title: "Profiel niet gevonden", robots: { index: false } };
  const description = p.tagline || p.bio.slice(0, 150) || `${p.discord.naam} bij Next Solutions`;
  return {
    title: `${p.discord.naam} (@${p.handle})`,
    description,
    alternates: { canonical: `${site.url}/u/${p.handle}` },
    openGraph: { title: `${p.discord.naam} • Next Solutions`, description, images: p.discord.banner ? [p.discord.banner] : [p.discord.avatar] },
  };
}

const texts = {
  nl: { level: "Niveau", badges: "Badges", stats: "Bij Next Solutions", projects: "projecten opgeleverd", reviews: "reviews", invites: "invites", delivered: "Opgeleverd", said: "Wat {naam} zei", cta: "Ook iets laten bouwen?", ctaText: "Next Solutions bouwt Discord bots, websites, game-scripts en designs.", quote: "Offerte aanvragen" },
  en: { level: "Level", badges: "Badges", stats: "At Next Solutions", projects: "projects delivered", reviews: "reviews", invites: "invites", delivered: "Delivered", said: "What {naam} said", cta: "Want something built too?", ctaText: "Next Solutions builds Discord bots, websites, game scripts and designs.", quote: "Request a quote" },
};

/** Public member profile at /u/[handle]. Only exists when the member made it public in their portal. */
export default async function PublicProfilePage({ params }: { params: Promise<{ handle: string }> }) {
  const [{ handle }, { locale, lp }] = await Promise.all([params, getI18n()]);
  const p = await getPublicProfile(handle.toLowerCase());
  if (!p) notFound();
  const tx = texts[locale];
  const earned = p.badges.filter((b) => b.behaald);

  return (
    <section className="pb-16 pt-32 sm:pt-36">
      <div className="container grid max-w-5xl gap-8 lg:grid-cols-[400px_1fr]">
        <div className="lg:sticky lg:top-28 lg:self-start"><ProfileCard profile={p} locale={locale} /></div>
        <div className="space-y-6">
          <div className="glass rounded-3xl p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">{tx.stats}</h2>
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              {[[p.stats.opgeleverd, tx.projects], [p.stats.reviews, tx.reviews], [p.stats.invites, tx.invites]].map(([n, l]) => (
                <div key={l as string}><p className="font-display text-3xl font-semibold text-white">{n}</p><p className="text-xs text-zinc-400">{l}</p></div>
              ))}
            </div>
          </div>
          {earned.length > 0 && (
            <div className="glass rounded-3xl p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">{tx.badges}</h2>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {earned.map((b) => (
                  <li key={b.id} className="flex items-center gap-3 rounded-2xl border border-brand-500/20 bg-brand-600/[0.06] p-3">
                    <span className="text-2xl">{b.emoji}</span><span><span className="block text-sm font-medium text-white">{b.naam}</span><span className="block text-xs text-zinc-400">{b.uitleg}</span></span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {p.opgeleverd.length > 0 && (
            <div className="glass rounded-3xl p-6">
              <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-zinc-400"><Rocket className="size-4" /> {tx.delivered}</h2>
              <ul className="mt-3 space-y-1.5 text-zinc-200">{p.opgeleverd.map((x) => <li key={x.naam}>✅ {x.naam}</li>)}</ul>
            </div>
          )}
          {p.reviews.length > 0 && (
            <div className="glass rounded-3xl p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">{tx.said.replace("{naam}", p.discord.naam)}</h2>
              <ul className="mt-4 space-y-4">
                {p.reviews.map((r) => (
                  <li key={r.id}>
                    <p className="flex gap-0.5 text-amber-300">{Array.from({ length: r.sterren }, (_, i) => <Star key={i} className="size-4 fill-current" />)}</p>
                    <p className="mt-1 text-zinc-200">“{r.tekst}”</p>
                    <p className="text-xs text-zinc-500">{r.context}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="rounded-3xl border border-brand-500/30 bg-brand-600/10 p-6">
            <p className="font-semibold text-white">{tx.cta}</p>
            <p className="mt-1 text-sm text-zinc-300">{tx.ctaText}</p>
            <Button asChild size="sm" className="mt-4"><Link href={lp("/contact")}>{tx.quote} <ArrowRight /></Link></Button>
          </div>
        </div>
      </div>
    </section>
  );
}
