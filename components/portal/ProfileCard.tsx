import { Building2, CalendarDays, Globe, Sparkles } from "lucide-react";
import Image from "next/image";
import { SOCIAL_LINKS, type Profile } from "@/lib/profile";
import { cn } from "@/lib/utils";

const texts = {
  nl: { activity: "Activiteit in Discord", rank: "#{n} van de server", member: "Lid sinds", account: "Discord sinds", about: "Over mij", roles: "Rollen", badges: "Badges", level: "Niveau", booster: "Boost de server sinds" },
  en: { activity: "Activity on Discord", rank: "#{n} in the server", member: "Member since", account: "On Discord since", about: "About me", roles: "Roles", badges: "Badges", level: "Level", booster: "Boosting since" },
};

/**
 * Profile card in the style of a Discord profile: banner (or accent colour), avatar with decoration,
 * server tag, Nitro, badges, level and the bio the member wrote on the site.
 */
export function ProfileCard({ profile: p, locale = "nl", compact = false }: { profile: Profile; locale?: "nl" | "en"; compact?: boolean }) {
  const tx = texts[locale];
  const d = p.discord;
  const accent = p.kleur ?? d.accentKleur ?? "#C6F432";
  const date = (t: number) => new Date(t).toLocaleDateString(locale === "en" ? "en-GB" : "nl-NL", { day: "numeric", month: "short", year: "numeric" });
  const badges = p.badges.filter((b) => b.behaald);

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#111214] shadow-glass">
      {/* Banner */}
      <div className="relative h-28 sm:h-32" style={{ background: d.banner ? undefined : `linear-gradient(135deg, ${accent}, ${accent}55)` }}>
        {d.banner && <Image src={d.banner} alt="" fill sizes="600px" className="object-cover" unoptimized />}
      </div>

      <div className="relative px-5 pb-5">
        {/* Avatar with decoration */}
        <div className="relative -mt-12 mb-3 size-[92px]">
          <Image src={d.avatar} alt="" width={84} height={84} className="absolute left-1 top-1 size-[84px] rounded-full border-[6px] border-[#111214] bg-[#111214]" unoptimized />
          {d.decoratie && <Image src={d.decoratie} alt="" width={92} height={92} className="pointer-events-none absolute inset-0 size-[92px]" unoptimized />}
        </div>

        {/* Name */}
        <div className="relative overflow-hidden rounded-2xl bg-[#1e1f22] p-4">
          {d.naamplaatje && <Image src={d.naamplaatje} alt="" fill sizes="600px" className="pointer-events-none object-cover opacity-40" unoptimized />}
          <div className="relative">
            <p className="flex flex-wrap items-center gap-2 text-xl font-bold text-white">
              {d.naam}
              {d.servertag && (
                <span className="inline-flex items-center gap-1 rounded-md bg-white/10 px-1.5 py-0.5 text-xs font-semibold text-zinc-200">
                  {d.servertag.badge && <Image src={d.servertag.badge} alt="" width={14} height={14} unoptimized />}
                  {d.servertag.tag}
                </span>
              )}
              {d.nitro && <span title="Nitro" className="inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-fuchsia-500/30 to-sky-500/30 px-1.5 py-0.5 text-[11px] font-semibold text-white"><Sparkles className="size-3" /> Nitro</span>}
            </p>
            <p className="text-sm text-zinc-400">@{d.gebruikersnaam}</p>
            {p.tagline && <p className="mt-2 text-sm text-zinc-200">{p.tagline}</p>}

            {/* Badges as small icons, like Discord */}
            {badges.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {badges.map((b) => (
                  <span key={b.id} title={`${b.naam}: ${b.uitleg}`} className="grid size-7 place-items-center rounded-lg bg-black/30 text-sm">{b.emoji}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 space-y-4 rounded-2xl bg-[#1e1f22] p-4 text-sm">
          {/* Level */}
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold uppercase tracking-wide text-zinc-400">{tx.level} {p.niveau.level} • {p.niveau.titel}</span>
              <span className="text-zinc-500">{p.niveau.xp} XP</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full" style={{ width: `${Math.max(4, p.niveau.procent)}%`, background: accent }} />
            </div>
          </div>

          {p.activiteit && p.activiteit.xp > 0 && (
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold uppercase tracking-wide text-zinc-400">{tx.activity}: level {p.activiteit.level}</span>
                {p.activiteit.plek && <span className="text-zinc-500">{tx.rank.replace("{n}", String(p.activiteit.plek))}</span>}
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-white/50" style={{ width: `${Math.max(4, p.activiteit.procent)}%` }} /></div>
            </div>
          )}

          {p.bio && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">{tx.about}</p>
              <p className="mt-1 whitespace-pre-line text-zinc-200">{p.bio}</p>
            </div>
          )}

          {(p.bedrijf || p.website || Object.keys(p.socials).length > 0) && (
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-zinc-300">
              {p.bedrijf && <span className="inline-flex items-center gap-1.5"><Building2 className="size-4 text-zinc-500" /> {p.bedrijf}</span>}
              {p.website && (
                <a href={p.website} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1.5 text-brand-300 hover:underline">
                  <Globe className="size-4" /> {p.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                </a>
              )}
              {Object.entries(p.socials).map(([k, v]) => v && (
                <a key={k} href={SOCIAL_LINKS[k]?.(v)} target="_blank" rel="noopener noreferrer nofollow" className="text-brand-300 hover:underline">
                  {k === "x" ? "X" : k.charAt(0).toUpperCase() + k.slice(1)}
                </a>
              ))}
            </div>
          )}

          <div className={cn("grid gap-3 text-xs", compact ? "grid-cols-1" : "grid-cols-2")}>
            {d.lidSinds && (
              <div>
                <p className="font-semibold uppercase tracking-wide text-zinc-400">{tx.member}</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-zinc-300"><CalendarDays className="size-3.5" /> {date(d.lidSinds)}</p>
              </div>
            )}
            <div>
              <p className="font-semibold uppercase tracking-wide text-zinc-400">{tx.account}</p>
              <p className="mt-0.5 text-zinc-300">{date(d.accountSinds)}</p>
            </div>
            {d.boostSinds && (
              <div>
                <p className="font-semibold uppercase tracking-wide text-zinc-400">{tx.booster}</p>
                <p className="mt-0.5 text-zinc-300">💎 {date(d.boostSinds)}</p>
              </div>
            )}
          </div>

          {d.rollen && d.rollen.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">{tx.roles}</p>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {d.rollen.map((r) => (
                  <span key={r.id} className="inline-flex items-center gap-1.5 rounded-md bg-white/[0.06] px-2 py-0.5 text-xs text-zinc-200">
                    <span className="size-2.5 rounded-full" style={{ background: r.kleur ?? "#7D8494" }} /> {r.naam}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
