"use client";

import { Pause, Play, Search, Terminal, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Notice, Panel, inputClass } from "@/components/dashboard/ui";
import { botApi, type LogLine } from "@/lib/dashboard";
import { cn } from "@/lib/utils";

const MAX_LINES = 1000;
const LEVEL_STYLE: Record<LogLine["niveau"], string> = {
  log: "text-zinc-300",
  warn: "text-amber-300",
  error: "text-rose-300",
};

/** Live console of the bot (polls new lines every 2 seconds). */
export function ConsoleTab() {
  const [lines, setLines] = useState<LogLine[]>([]);
  const [paused, setPaused] = useState(false);
  const [filter, setFilter] = useState<"alles" | "warn" | "error">("alles");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const lastId = useRef(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);

  useEffect(() => {
    if (paused) return;
    let active = true;
    async function poll() {
      try {
        const { regels, laatste } = await botApi<{ regels: LogLine[]; laatste: number }>("GET", `logs?na=${lastId.current}`);
        if (!active) return;
        // After a restart the numbering starts again
        if (laatste < lastId.current) lastId.current = 0;
        if (regels.length) {
          lastId.current = regels[regels.length - 1].id;
          setLines((prev) => [...prev, ...regels].slice(-MAX_LINES));
        }
        setError("");
      } catch (err) {
        if (active) setError((err as Error).message);
      }
    }
    poll();
    const timer = setInterval(poll, 2000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [paused]);

  useEffect(() => {
    const box = boxRef.current;
    if (box && stickToBottom.current) box.scrollTop = box.scrollHeight;
  }, [lines]);

  const visible = lines.filter(
    (l) => (filter === "alles" || l.niveau === filter || (filter === "warn" && l.niveau === "error")) && (!search || l.tekst.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <Panel
      title="Console"
      icon={Terminal}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
            <input className={cn(inputClass, "w-44 pl-9")} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Zoeken" aria-label="Zoeken in console" />
          </div>
          <select className={cn(inputClass, "w-40")} value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} aria-label="Filter">
            <option value="alles">Alles</option>
            <option value="warn">Waarschuwingen + fouten</option>
            <option value="error">Alleen fouten</option>
          </select>
          <button type="button" onClick={() => setPaused(!paused)} className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-sm text-zinc-300 hover:text-white">
            {paused ? <Play className="size-4" /> : <Pause className="size-4" />} {paused ? "Hervatten" : "Pauzeren"}
          </button>
          <button type="button" onClick={() => setLines([])} className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-sm text-zinc-300 hover:text-white">
            <Trash2 className="size-4" /> Leegmaken
          </button>
        </div>
      }
    >
      {error && (
        <div className="mb-3">
          <Notice>{error}</Notice>
        </div>
      )}
      <div
        ref={boxRef}
        onScroll={(e) => {
          const el = e.currentTarget;
          stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
        }}
        className="h-[560px] overflow-auto rounded-2xl border border-white/10 bg-black/60 p-4 font-mono text-xs leading-relaxed"
        role="log"
        aria-live="polite"
      >
        {visible.length === 0 ? (
          <p className="text-zinc-500">Nog geen regels{paused ? " (gepauzeerd)" : "..."}</p>
        ) : (
          visible.map((l) => (
            <div key={`${l.t}-${l.id}`} className={cn("whitespace-pre-wrap break-words", LEVEL_STYLE[l.niveau])}>
              <span className="select-none text-zinc-600">{new Date(l.t).toLocaleTimeString("nl-NL")} </span>
              {l.tekst}
            </div>
          ))
        )}
      </div>
    </Panel>
  );
}
