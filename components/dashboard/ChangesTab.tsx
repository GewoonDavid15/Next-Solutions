"use client";

import { History, Loader2, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Loading, Notice, Panel, RestartButton } from "@/components/dashboard/ui";
import { botApi, type Json } from "@/lib/dashboard";

interface Change {
  id: number;
  t: number;
  soort: "instellingen" | "script";
  systeem?: string;
  groep?: string;
  oud?: Json;
  nieuw?: Json;
  reset?: boolean;
  actie?: string;
  pad?: string;
  backup?: string | null;
}

const short = (v: Json | undefined) => {
  const text = typeof v === "string" ? `"${v}"` : JSON.stringify(v);
  return text === undefined ? "—" : text.length > 60 ? `${text.slice(0, 57)}...` : text;
};

/** Lists the paths that differ between two values, e.g. "CONFIG.MAX_MENTIONS: 6 → 9". */
function diff(oud: Json | undefined, nieuw: Json | undefined, path: string, out: string[] = []): string[] {
  if (out.length >= 6) return out;
  const isObj = (v: Json | undefined): v is { [k: string]: Json } => v !== null && typeof v === "object" && !Array.isArray(v);
  if (isObj(oud) && isObj(nieuw)) {
    for (const key of new Set([...Object.keys(oud), ...Object.keys(nieuw)])) diff(oud[key], nieuw[key], `${path}.${key}`, out);
  } else if (JSON.stringify(oud) !== JSON.stringify(nieuw)) {
    out.push(`${path}: ${short(oud)} → ${short(nieuw)}`);
  }
  return out;
}

const SCRIPT_ACTIONS: Record<string, string> = {
  toegevoegd: "Script toegevoegd",
  bijgewerkt: "Script bewerkt",
  verwijderd: "Script verwijderd",
  aangezet: "Script aangezet",
  uitgezet: "Script uitgezet",
  hersteld: "Script hersteld",
};

export function ChangesTab() {
  const [changes, setChanges] = useState<Change[] | null>(null);
  const [busy, setBusy] = useState<number | null>(null);
  const [message, setMessage] = useState<{ kind: "error" | "success" | "info"; text: string } | null>(null);

  const load = useCallback(async () => {
    try {
      setChanges((await botApi<{ wijzigingen: Change[] }>("GET", "wijzigingen")).wijzigingen);
    } catch (err) {
      setMessage({ kind: "error", text: (err as Error).message });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function undo(c: Change) {
    if (!window.confirm("Deze wijziging terugdraaien?")) return;
    setBusy(c.id);
    setMessage(null);
    try {
      const res = await botApi<{ herstartNodig: boolean }>("POST", "wijzigingen/terugdraaien", { id: c.id });
      setMessage({ kind: res.herstartNodig ? "info" : "success", text: res.herstartNodig ? "Teruggedraaid. Herstart de bot om het script opnieuw te laden." : "Teruggedraaid. De oude instelling is direct actief." });
      await load();
    } catch (err) {
      setMessage({ kind: "error", text: (err as Error).message });
    } finally {
      setBusy(null);
    }
  }

  if (!changes) return message ? <Notice>{message.text}</Notice> : <Loading />;

  return (
    <Panel title="Wijzigingen" icon={History} actions={<RestartButton />}>
      <p className="text-sm text-zinc-400">Elke wijziging via het dashboard (de laatste 200). Draai een fout met één klik terug.</p>
      {message && (
        <div className="mt-3">
          <Notice kind={message.kind}>{message.text}</Notice>
        </div>
      )}
      {changes.length === 0 ? (
        <p className="mt-6 text-sm text-zinc-500">Nog geen wijzigingen.</p>
      ) : (
        <ul className="mt-4 divide-y divide-white/5">
          {changes.map((c) => (
            <li key={c.id} className="flex flex-wrap items-start justify-between gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-white">
                  {c.soort === "instellingen" ? (
                    <>
                      <span className="capitalize">{c.systeem}</span> › {c.groep}
                      {c.reset && <span className="ml-2 text-xs text-zinc-500">(standaard teruggezet)</span>}
                    </>
                  ) : (
                    <>
                      {SCRIPT_ACTIONS[c.actie ?? ""] ?? c.actie}: <span className="font-mono">{c.pad}</span>
                    </>
                  )}
                </p>
                <p className="text-xs text-zinc-500">
                  #{c.id} • {new Date(c.t).toLocaleString("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </p>
                {c.soort === "instellingen" && (
                  <ul className="mt-1.5 space-y-0.5">
                    {diff(c.oud, c.nieuw, c.groep ?? "").map((line) => (
                      <li key={line} className="break-all font-mono text-[11px] text-zinc-400">
                        {line}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {(c.soort === "instellingen" || c.actie !== "hersteld") && (
                <button
                  type="button"
                  onClick={() => undo(c)}
                  disabled={busy !== null}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-1.5 text-sm text-zinc-300 hover:border-brand-500/50 hover:text-white disabled:opacity-50"
                >
                  {busy === c.id ? <Loader2 className="size-4 animate-spin" /> : <RotateCcw className="size-4" />} Terugdraaien
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
