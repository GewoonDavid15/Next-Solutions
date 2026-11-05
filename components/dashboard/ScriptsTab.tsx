"use client";

import { FileCode2, Loader2, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Loading, Notice, Panel, RestartButton, Toggle, inputClass } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/Button";
import { botApi, type ModuleInfo } from "@/lib/dashboard";
import { cn } from "@/lib/utils";

const STATUS: Record<ModuleInfo["status"], { label: string; style: string }> = {
  geladen: { label: "Actief", style: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200" },
  uit: { label: "Uit", style: "border-white/10 bg-white/5 text-zinc-400" },
  fout: { label: "Fout", style: "border-rose-500/30 bg-rose-500/10 text-rose-200" },
  overgeslagen: { label: "Overgeslagen", style: "border-amber-500/30 bg-amber-500/10 text-amber-200" },
  nieuw: { label: "Nieuw", style: "border-sky-500/30 bg-sky-500/10 text-sky-200" },
};

const TEMPLATE = `const { Events } = require('discord.js');

module.exports = (client) => {
    // Optioneel: maak instellingen aanpasbaar via het dashboard
    const CONFIG = { KANAAL_ID: '', AAN: true };
    client.instellingen?.registreer('mijnscript', { CONFIG }, { beschrijving: 'Mijn eigen script' });

    client.on(Events.MessageCreate, (message) => {
        if (!CONFIG.AAN || message.author.bot) return;
        if (message.content === '!ping') message.reply('Pong! 🏓');
    });
};
`;

interface Editing {
  path: string;
  code: string;
  isNew: boolean;
}

export function ScriptsTab() {
  const [modules, setModules] = useState<ModuleInfo[] | null>(null);
  const [editing, setEditing] = useState<Editing | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ kind: "error" | "success" | "info"; text: string } | null>(null);
  const [needsRestart, setNeedsRestart] = useState(false);

  const load = useCallback(async () => {
    try {
      setModules((await botApi<{ modules: ModuleInfo[] }>("GET", "modules")).modules);
    } catch (err) {
      setMessage({ kind: "error", text: (err as Error).message });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function run(key: string, action: () => Promise<unknown>, success: string) {
    setBusy(key);
    setMessage(null);
    try {
      await action();
      setMessage({ kind: "success", text: success });
      setNeedsRestart(true);
      await load();
      return true;
    } catch (err) {
      setMessage({ kind: "error", text: (err as Error).message });
      return false;
    } finally {
      setBusy(null);
    }
  }

  async function openEditor(path: string) {
    setBusy(`open:${path}`);
    try {
      const { code } = await botApi<{ code: string }>("GET", `modules/code?pad=${encodeURIComponent(path)}`);
      setEditing({ path, code, isNew: false });
      setMessage(null);
    } catch (err) {
      setMessage({ kind: "error", text: (err as Error).message });
    } finally {
      setBusy(null);
    }
  }

  async function saveEditor() {
    if (!editing) return;
    const path = editing.path.trim().endsWith(".js") ? editing.path.trim() : `${editing.path.trim()}.js`;
    if (editing.isNew && modules?.some((m) => m.bestand === path) && !window.confirm(`${path} bestaat al. Overschrijven?`)) return;
    const ok = await run("save", () => botApi("PUT", "modules/code", { pad: path, code: editing.code }), `${path} opgeslagen (er is een backup gemaakt van de vorige versie). Herstart de bot om het te laden.`);
    if (ok) setEditing(null);
  }

  if (!modules) return message ? <Notice>{message.text}</Notice> : <Loading />;

  return (
    <div className="space-y-6">
      <Panel
        title="Scripts"
        icon={FileCode2}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" size="sm" variant="secondary" onClick={() => setEditing({ path: "mijnscript.js", code: TEMPLATE, isNew: true })}>
              <Plus /> Nieuw script
            </Button>
            <RestartButton />
          </div>
        }
      >
        <p className="text-sm text-zinc-400">
          Alle scripts uit de map <code className="text-brand-200">Systeem</code> van je bot. Wijzigingen worden actief na een herstart.
        </p>
        {needsRestart && (
          <div className="mt-3">
            <Notice kind="info">Er zijn wijzigingen die pas werken na een herstart van de bot.</Notice>
          </div>
        )}
        {message && (
          <div className="mt-3">
            <Notice kind={message.kind}>{message.text}</Notice>
          </div>
        )}

        <ul className="mt-4 divide-y divide-white/5">
          {modules.map((m) => (
            <li key={m.bestand} className="flex flex-wrap items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 font-mono text-sm">
                  {m.bestand}
                  <span className={cn("rounded-full border px-2 py-0.5 font-sans text-xs", STATUS[m.status].style)}>{STATUS[m.status].label}</span>
                  {m.beschermd && <span className="font-sans text-xs text-zinc-500">(dashboard)</span>}
                </p>
                {m.fout && <p className="mt-1 break-words text-xs text-rose-300">{m.fout}</p>}
                <p className="mt-0.5 text-xs text-zinc-500">{(m.grootte / 1024).toFixed(1)} KB</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">{m.aanNaHerstart ? "Aan" : "Uit"}</span>
                <Toggle
                  checked={m.aanNaHerstart}
                  disabled={m.beschermd || busy !== null}
                  label={`${m.bestand} aan of uit`}
                  onChange={(aan) => run(`toggle:${m.bestand}`, () => botApi("POST", "modules/status", { pad: m.bestand, aan }), `${m.bestand} staat ${aan ? "aan" : "uit"} na de volgende herstart.`)}
                />
                <button
                  type="button"
                  onClick={() => openEditor(m.bestand)}
                  disabled={busy !== null}
                  className="rounded-lg p-2 text-zinc-400 hover:bg-white/5 hover:text-white disabled:opacity-50"
                  aria-label={`${m.bestand} bewerken`}
                >
                  {busy === `open:${m.bestand}` ? <Loader2 className="size-4 animate-spin" /> : <Pencil className="size-4" />}
                </button>
                {!m.beschermd && (
                  <button
                    type="button"
                    disabled={busy !== null}
                    onClick={() =>
                      window.confirm(`${m.bestand} verwijderen? Er wordt een backup gemaakt in data/backups.`) &&
                      run(`del:${m.bestand}`, () => botApi("DELETE", `modules/code?pad=${encodeURIComponent(m.bestand)}`), `${m.bestand} verwijderd. Herstart de bot om het te stoppen.`)
                    }
                    className="rounded-lg p-2 text-zinc-500 hover:bg-rose-500/10 hover:text-rose-300 disabled:opacity-50"
                    aria-label={`${m.bestand} verwijderen`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Panel>

      {editing && (
        <Panel
          title={editing.isNew ? "Nieuw script" : editing.path}
          icon={Pencil}
          actions={
            <div className="flex items-center gap-2">
              <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(null)}>
                <X /> Annuleren
              </Button>
              <Button type="button" size="sm" onClick={saveEditor} disabled={busy !== null}>
                {busy === "save" ? <Loader2 className="animate-spin" /> : <Save />} Opslaan
              </Button>
            </div>
          }
        >
          {editing.isNew && (
            <label className="mb-3 block space-y-1.5 text-sm font-medium text-zinc-300">
              Bestandsnaam
              <input className={cn(inputClass, "font-mono sm:w-72")} value={editing.path} onChange={(e) => setEditing({ ...editing, path: e.target.value })} />
            </label>
          )}
          {editing.path === "dashboard-api.js" && (
            <div className="mb-3">
              <Notice>Pas op: met een fout in dit bestand kom je niet meer in het dashboard. Herstel dan via Craftnode.</Notice>
            </div>
          )}
          <textarea
            className={cn(inputClass, "min-h-[480px] whitespace-pre font-mono text-xs leading-relaxed")}
            spellCheck={false}
            value={editing.code}
            onChange={(e) => setEditing({ ...editing, code: e.target.value })}
            onKeyDown={(e) => {
              // Tab inserts four spaces instead of leaving the editor
              if (e.key !== "Tab") return;
              e.preventDefault();
              const el = e.currentTarget;
              const { selectionStart: s, selectionEnd: end } = el;
              const code = `${editing.code.slice(0, s)}    ${editing.code.slice(end)}`;
              setEditing({ ...editing, code });
              requestAnimationFrame(() => el.setSelectionRange(s + 4, s + 4));
            }}
            aria-label="Code"
          />
          <p className="mt-2 text-xs text-zinc-500">De bot controleert de code op syntaxfouten voordat hij wordt opgeslagen.</p>
        </Panel>
      )}
    </div>
  );
}
