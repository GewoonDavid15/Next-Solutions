"use client";

import { Loader2, RotateCcw, Save, Search, Settings } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Loading, Notice, Panel, RestartButton, inputClass } from "@/components/dashboard/ui";
import { Field } from "@/components/dashboard/ValueEditor";
import { Button } from "@/components/ui/Button";
import { botApi, humanizeKey, type Json, type ServerInfo, type SettingsSystem } from "@/lib/dashboard";
import { cn } from "@/lib/utils";

const GROUP_LABELS: Record<string, string> = {
  CONFIG: "Algemeen",
  AFDELINGEN: "Afdelingen",
  ALGEMENE_ROL: "Algemene staff-rol",
  OPENINGSTIJDEN: "Openingstijden",
  REGLEMENTEN: "Reglementen",
  STAFF_PROFIELEN: "Staffprofielen",
  DIENSTEN: "Diensten",
  FASES: "Projectfases",
  CATEGORIEEN: "Categorieën",
  SCAM_TREFWOORDEN: "Scam-trefwoorden",
  MERKEN: "Merknamen (lookalike-detectie)",
  VEILIGE_DOMEINEN: "Veilige domeinen",
  BOT: "Botstatus",
};

export function SettingsTab() {
  const [systems, setSystems] = useState<SettingsSystem[] | null>(null);
  const [server, setServer] = useState<ServerInfo | null>(null);
  const [selected, setSelected] = useState<string>("");
  const [draft, setDraft] = useState<Record<string, Json>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

  // Selecting a system starts a fresh draft of its values
  const selectSystem = useCallback((naam: string, list: SettingsSystem[]) => {
    setSelected(naam);
    setDraft(clone(list.find((s) => s.naam === naam)?.waarden ?? {}));
    setMessage(null);
  }, []);

  const load = useCallback(
    async (keep?: string) => {
      try {
        const [{ systemen }, srv] = await Promise.all([
          botApi<{ systemen: SettingsSystem[] }>("GET", "instellingen"),
          botApi<ServerInfo>("GET", "server").catch(() => null),
        ]);
        setSystems(systemen);
        setServer(srv);
        selectSystem(keep ?? systemen.find((x) => x.naam !== "bot")?.naam ?? systemen[0]?.naam ?? "", systemen);
      } catch (err) {
        setMessage({ kind: "error", text: (err as Error).message });
      }
    },
    [selectSystem],
  );

  useEffect(() => {
    load();
  }, [load]);

  const system = useMemo(() => systems?.find((s) => s.naam === selected) ?? null, [systems, selected]);

  async function save(group: string) {
    if (!system) return;
    setBusy(group);
    setMessage(null);
    try {
      await botApi("PUT", "instellingen", { systeem: system.naam, waarden: { [group]: draft[group] } });
      // Mark this group as saved without throwing away unsaved edits in other groups
      setSystems((prev) => prev?.map((s) => (s.naam === system.naam ? { ...s, waarden: { ...s.waarden, [group]: clone(draft[group]) } } : s)) ?? prev);
      setMessage({ kind: "success", text: `${GROUP_LABELS[group] ?? humanizeKey(group)} opgeslagen. De meeste wijzigingen werken direct; panelen en ID's soms pas na een herstart.` });
    } catch (err) {
      setMessage({ kind: "error", text: (err as Error).message });
    } finally {
      setBusy(null);
    }
  }

  async function reset() {
    if (!system || !window.confirm(`Alle instellingen van "${system.naam}" terugzetten naar de standaard uit de code?`)) return;
    setBusy("__reset");
    try {
      await botApi("POST", "instellingen/reset", { systeem: system.naam });
      await load(system.naam);
      setMessage({ kind: "success", text: "Teruggezet naar de standaardinstellingen." });
    } catch (err) {
      setMessage({ kind: "error", text: (err as Error).message });
    } finally {
      setBusy(null);
    }
  }

  if (!systems) return message ? <Notice>{message.text}</Notice> : <Loading />;
  if (!systems.length) return <Notice kind="info">Er zijn nog geen systemen met instellingen aangemeld. Gebruik de nieuwste versies van je scripts.</Notice>;

  const isDirty = (group: string) => JSON.stringify(draft[group]) !== JSON.stringify(system?.waarden[group]);

  // Search across every setting of every system ("kanaal", "kleur", "timeout", ...)
  const results =
    query.trim().length < 2
      ? []
      : systems
          .filter((s) => s.naam !== "bot")
          .flatMap((s) => Object.entries(s.waarden).flatMap(([group, value]) => findMatches(value, query.trim().toLowerCase(), group).map((path) => ({ system: s.naam, group, path }))))
          .slice(0, 30);

  function openResult(r: { system: string; group: string }) {
    if (!systems) return;
    if (r.system !== selected) selectSystem(r.system, systems);
    setQuery("");
    // Scroll to the group once it is rendered
    setTimeout(() => document.getElementById(`groep-${r.group}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <div className="space-y-3 lg:sticky lg:top-28 lg:h-fit">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
          <input className={cn(inputClass, "pl-9")} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Zoek een instelling..." aria-label="Zoek een instelling" />
          {results.length > 0 && (
            <ul className="absolute z-20 mt-2 max-h-80 w-full overflow-auto rounded-2xl border border-white/10 bg-[#120f1d] p-1 shadow-xl">
              {results.map((r) => (
                <li key={`${r.system}-${r.path}`}>
                  <button type="button" onClick={() => openResult(r)} className="w-full rounded-xl px-3 py-2 text-left hover:bg-white/5">
                    <span className="block text-sm text-white">{humanizeKey(r.path.split(/[.[]/).pop()!.replace("]", ""))}</span>
                    <span className="block truncate font-mono text-[11px] text-zinc-500">{r.system} › {r.path}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {query.trim().length >= 2 && results.length === 0 && <p className="mt-2 px-1 text-xs text-zinc-500">Niets gevonden</p>}
        </div>

      <nav className="glass flex gap-1 overflow-x-auto rounded-3xl p-2 lg:block" aria-label="Systemen">
        {systems
          .filter((s) => s.naam !== "bot")
          .map((s) => (
            <button
              key={s.naam}
              type="button"
              onClick={() => systems && selectSystem(s.naam, systems)}
              className={cn(
                "shrink-0 rounded-2xl px-4 py-3 text-left transition lg:w-full",
                selected === s.naam ? "bg-brand-600/20 text-white" : "text-zinc-400 hover:bg-white/5 hover:text-white",
              )}
            >
              <span className="block text-sm font-medium capitalize">{s.naam}</span>
              {s.beschrijving && <span className="mt-0.5 hidden text-xs text-zinc-500 lg:block">{s.beschrijving}</span>}
            </button>
          ))}
      </nav>
      </div>

      <div className="min-w-0 space-y-6">
        {system && (
          <Panel
            title={system.naam.charAt(0).toUpperCase() + system.naam.slice(1)}
            icon={Settings}
            actions={
              <div className="flex flex-wrap items-center gap-3">
                <Button type="button" size="sm" variant="ghost" onClick={reset} disabled={busy !== null}>
                  <RotateCcw /> Standaard
                </Button>
                <RestartButton />
              </div>
            }
          >
            <p className="text-sm text-zinc-400">{system.beschrijving}</p>
            {!server && <p className="mt-2 text-xs text-amber-300">Kanalen en rollen konden niet geladen worden: ID&apos;s kun je wel handmatig invullen.</p>}
          </Panel>
        )}

        {message && <Notice kind={message.kind}>{message.text}</Notice>}

        {Object.keys(draft).map((group) => (
          <div key={`${selected}-${group}`} id={`groep-${group}`} className="scroll-mt-28">
          <Panel
            title={GROUP_LABELS[group] ?? humanizeKey(group)}
            actions={
              <Button type="button" size="sm" onClick={() => save(group)} disabled={!isDirty(group) || busy !== null}>
                {busy === group ? <Loader2 className="animate-spin" /> : <Save />} Opslaan
              </Button>
            }
          >
            <Field name={group} label="" value={draft[group]} onChange={(v) => setDraft((d) => ({ ...d, [group]: v }))} server={server} path={group} />
            {isDirty(group) && <p className="mt-4 text-xs text-amber-300">Niet-opgeslagen wijzigingen</p>}
          </Panel>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Paths of all keys (and text values) inside a setting that contain the search term. */
function findMatches(value: Json, q: string, path: string): string[] {
  const own = path.toLowerCase().split(/[.[\]]/).pop() ?? "";
  const hit = own.includes(q) || humanizeKey(own.toUpperCase()).toLowerCase().includes(q) || (typeof value === "string" && value.toLowerCase().includes(q));
  const children =
    value !== null && typeof value === "object"
      ? Array.isArray(value)
        ? value.flatMap((v, i) => findMatches(v, q, `${path}[${i}]`))
        : Object.entries(value).flatMap(([k, v]) => findMatches(v, q, `${path}.${k}`))
      : [];
  return hit && !children.length ? [path] : children.length ? children : [];
}
