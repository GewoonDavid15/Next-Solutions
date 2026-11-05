"use client";

import { Bot, Loader2, Plus, Radio, Save, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Loading, Notice, Panel, inputClass } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/Button";
import { botApi, type Overview, type SettingsSystem } from "@/lib/dashboard";
import { cn } from "@/lib/utils";

interface PresenceItem {
  tekst: string;
  type: string;
}
interface PresenceSettings {
  ONLINE_STATUS: string;
  WISSEL_SECONDEN: number;
  STATUSSEN: PresenceItem[];
}

const ONLINE = [
  { id: "online", label: "Online", color: "bg-emerald-400" },
  { id: "idle", label: "Afwezig", color: "bg-amber-400" },
  { id: "dnd", label: "Niet storen", color: "bg-rose-400" },
  { id: "invisible", label: "Onzichtbaar", color: "bg-zinc-500" },
];

const TYPES = [
  { id: "Playing", label: "Speelt", prefix: "Speelt" },
  { id: "Listening", label: "Luistert naar", prefix: "Luistert naar" },
  { id: "Watching", label: "Kijkt naar", prefix: "Kijkt naar" },
  { id: "Competing", label: "Doet mee aan", prefix: "Doet mee aan" },
  { id: "Custom", label: "Eigen status", prefix: "" },
];

/** Discord status ("Rich Presence") of the bot: online status and rotating activities. */
export function PresenceTab() {
  const [settings, setSettings] = useState<PresenceSettings | null>(null);
  const [saved, setSaved] = useState("");
  const [overview, setOverview] = useState<Overview | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const [preview, setPreview] = useState(0);

  const load = useCallback(async () => {
    try {
      const [{ systemen }, o] = await Promise.all([
        botApi<{ systemen: SettingsSystem[] }>("GET", "instellingen"),
        botApi<Overview>("GET", "overzicht").catch(() => null),
      ]);
      const bot = systemen.find((s) => s.naam === "bot")?.waarden.BOT as unknown as PresenceSettings | undefined;
      if (!bot) throw new Error("Deze index.js ondersteunt de botstatus nog niet. Gebruik de nieuwste index.js.");
      setSettings(bot);
      setSaved(JSON.stringify(bot));
      setOverview(o);
    } catch (err) {
      setMessage({ kind: "error", text: (err as Error).message });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const count = settings?.STATUSSEN.length ?? 0;
  useEffect(() => {
    if (!count) return;
    const timer = setInterval(() => setPreview((p) => (p + 1) % count), 3000);
    return () => clearInterval(timer);
  }, [count]);

  if (!settings) return message ? <Notice>{message.text}</Notice> : <Loading />;

  const update = (patch: Partial<PresenceSettings>) => setSettings({ ...settings, ...patch });
  const updateItem = (i: number, patch: Partial<PresenceItem>) =>
    update({ STATUSSEN: settings.STATUSSEN.map((s, j) => (j === i ? { ...s, ...patch } : s)) });

  async function save() {
    setBusy(true);
    setMessage(null);
    try {
      await botApi("PUT", "instellingen", { systeem: "bot", waarden: { BOT: settings } });
      setSaved(JSON.stringify(settings));
      setMessage({ kind: "success", text: "Opgeslagen. De nieuwe status staat direct op Discord." });
    } catch (err) {
      setMessage({ kind: "error", text: (err as Error).message });
    } finally {
      setBusy(false);
    }
  }

  const fill = (text: string) =>
    text.replace(/\{leden\}/g, String(overview?.server?.leden ?? 0)).replace(/\{servers\}/g, overview?.server ? "1" : "0");
  const current = settings.STATUSSEN[preview % Math.max(1, count)];
  const currentType = TYPES.find((t) => t.id === current?.type);
  const online = ONLINE.find((o) => o.id === settings.ONLINE_STATUS) ?? ONLINE[0];
  const dirty = JSON.stringify(settings) !== saved;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Panel
        title="Botstatus"
        icon={Radio}
        actions={
          <Button type="button" size="sm" onClick={save} disabled={!dirty || busy}>
            {busy ? <Loader2 className="animate-spin" /> : <Save />} Opslaan
          </Button>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5 text-sm font-medium text-zinc-300">
            Online-status
            <select className={inputClass} value={settings.ONLINE_STATUS} onChange={(e) => update({ ONLINE_STATUS: e.target.value })}>
              {ONLINE.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1.5 text-sm font-medium text-zinc-300">
            Wissel elke (seconden)
            <input type="number" min={10} className={inputClass} value={settings.WISSEL_SECONDEN} onChange={(e) => update({ WISSEL_SECONDEN: Math.max(10, Number(e.target.value) || 10) })} />
          </label>
        </div>

        <h3 className="mt-6 text-sm font-medium text-zinc-300">Statussen (wisselen automatisch)</h3>
        <p className="mt-1 text-xs text-zinc-500">
          Gebruik <code className="text-brand-200">{"{leden}"}</code> voor het aantal leden en <code className="text-brand-200">{"{servers}"}</code> voor het aantal servers.
        </p>
        <div className="mt-3 space-y-2">
          {settings.STATUSSEN.map((s, i) => (
            <div key={i} className="flex flex-col gap-2 sm:flex-row">
              <select className={cn(inputClass, "sm:w-44")} value={s.type} onChange={(e) => updateItem(i, { type: e.target.value })} aria-label="Soort status">
                {TYPES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
              <input className={inputClass} value={s.tekst} maxLength={128} onChange={(e) => updateItem(i, { tekst: e.target.value })} aria-label="Statustekst" />
              <button
                type="button"
                onClick={() => update({ STATUSSEN: settings.STATUSSEN.filter((_, j) => j !== i) })}
                className="self-start rounded-lg p-2 text-zinc-500 hover:bg-rose-500/10 hover:text-rose-300 sm:self-center"
                aria-label="Status verwijderen"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => update({ STATUSSEN: [...settings.STATUSSEN, { tekst: "", type: "Playing" }] })}
            className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-white/15 px-3 py-1.5 text-sm text-zinc-400 hover:border-brand-500/50 hover:text-white"
          >
            <Plus className="size-4" /> Status toevoegen
          </button>
        </div>

        {message && (
          <div className="mt-4">
            <Notice kind={message.kind}>{message.text}</Notice>
          </div>
        )}
      </Panel>

      <Panel title="Voorbeeld" className="h-fit">
        <div className="rounded-2xl bg-[#232428] p-4">
          <div className="flex items-center gap-3">
            <span className="relative">
              <span className="grid size-12 place-items-center rounded-full bg-brand-600/30">
                <Bot className="size-6 text-brand-200" />
              </span>
              <span className={cn("absolute -bottom-0.5 -right-0.5 size-4 rounded-full border-[3px] border-[#232428]", online.color)} />
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold">{overview?.bot.tag?.split("#")[0] ?? "Next Solutions Bot"}</p>
              <p className="truncate text-sm text-zinc-400">
                {current?.tekst ? (
                  <>
                    {currentType?.prefix && <span className="text-zinc-500">{currentType.prefix} </span>}
                    <span className="text-zinc-200">{fill(current.tekst)}</span>
                  </>
                ) : (
                  "Geen status"
                )}
              </p>
            </div>
          </div>
        </div>
        <p className="mt-3 text-xs text-zinc-500">Zo ziet je bot eruit in de ledenlijst. Het voorbeeld wisselt mee.</p>
      </Panel>
    </div>
  );
}
