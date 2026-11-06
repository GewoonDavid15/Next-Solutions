import { Trophy } from "lucide-react";
import Image from "next/image";

/** Most active members of the Discord server (levels from the bot, no rewards). */
export function LevelLeaderboard({ levels, locale }: { levels: { id: string; naam: string; avatar: string | null; xp: number; level: number }[]; locale: "nl" | "en" }) {
  const en = locale === "en";
  return (
    <div className="glass rounded-3xl p-6 sm:p-8">
      <h2 className="flex items-center gap-2 text-xl font-semibold"><Trophy className="size-5 text-brand-300" /> {en ? "Most active members" : "Meest actieve leden"}</h2>
      <p className="mt-1 text-sm text-zinc-400">{en ? "Earn XP by chatting and talking in voice. Check your level with /level in Discord." : "Verdien XP door te chatten en in voice te praten. Bekijk je level met /level in Discord."}</p>
      <ol className="mt-5 grid gap-2 sm:grid-cols-2">
        {levels.map((l, i) => (
          <li key={l.id} className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-3">
            <span className="w-7 text-center text-lg">{["🥇", "🥈", "🥉"][i] ?? <span className="text-sm text-zinc-500">{i + 1}</span>}</span>
            {l.avatar ? <Image src={l.avatar} alt="" width={36} height={36} className="size-9 rounded-full" unoptimized /> : <span className="size-9 rounded-full bg-white/10" />}
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-white">{l.naam}</span>
            <span className="text-right text-xs"><b className="text-brand-200">Level {l.level}</b><span className="block text-zinc-500">{l.xp.toLocaleString(en ? "en-GB" : "nl-NL")} XP</span></span>
          </li>
        ))}
      </ol>
    </div>
  );
}
