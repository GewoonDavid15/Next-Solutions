"use client";

import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Toggle, inputClass } from "@/components/dashboard/ui";
import { humanizeKey, type Json, type JsonObject, type ServerInfo } from "@/lib/dashboard";
import { cn } from "@/lib/utils";

/**
 * Generic editor for any JSON setting coming from the bot. The input type is derived from
 * the value and the key name, e.g. "LOGS_KANAAL_ID" becomes a channel picker and "KLEUR" a colour picker.
 */

const DAYS = ["Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"];
const DISCORD_ID = /^\d{17,20}$/;
const TIME = /^\d{2}:\d{2}$/;

const isObject = (v: Json): v is JsonObject => v !== null && typeof v === "object" && !Array.isArray(v);
const isListObject = (v: Json): v is JsonObject => isObject(v) && Object.keys(v).length > 0 && Object.values(v).every(isObject);

type IdKind = "rol" | "categorie" | "kanaal" | null;

/** Decides from the key name whether a string holds a Discord channel, category or role ID. */
function idKind(key: string): IdKind {
  const k = key.toUpperCase();
  if (/ROL/.test(k) && /(ID|ROLLEN)/.test(k)) return "rol";
  if (/CATEGORIE/.test(k) && /ID/.test(k)) return "categorie";
  if (/(KANAAL|KANALEN|CHANNEL)/.test(k) && /(ID|KANALEN)/.test(k)) return "kanaal";
  if (k === "STAFF_ROLLEN" || k === "VEILIGE_ROLLEN") return "rol";
  return null;
}

function IdPicker({ kind, value, onChange, server }: { kind: Exclude<IdKind, null>; value: string; onChange: (v: string) => void; server: ServerInfo | null }) {
  const options =
    kind === "rol"
      ? (server?.rollen ?? []).map((r) => ({ id: r.id, label: `@${r.naam}` }))
      : (server?.kanalen ?? [])
          .filter((c) => (kind === "categorie" ? c.type === "categorie" : c.type !== "categorie"))
          .map((c) => ({ id: c.id, label: `${c.type === "categorie" ? "📂" : c.type === "voice" ? "🔊" : "#"} ${c.naam}${c.categorie ? `  (${c.categorie})` : ""}` }));
  const known = value === "" || options.some((o) => o.id === value);

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <select className={cn(inputClass, "sm:flex-1")} value={known ? value : "__anders"} onChange={(e) => e.target.value !== "__anders" && onChange(e.target.value)}>
        <option value="">— Geen —</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
        {!known && <option value="__anders">Onbekend ID ({value})</option>}
      </select>
      <input className={cn(inputClass, "font-mono sm:w-52")} value={value} onChange={(e) => onChange(e.target.value.trim())} placeholder="of plak een ID" aria-label="ID" />
    </div>
  );
}

function ColorInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const hex = `#${Math.max(0, Math.min(0xffffff, value)).toString(16).padStart(6, "0")}`;
  return (
    <div className="flex items-center gap-3">
      <input type="color" value={hex} onChange={(e) => onChange(parseInt(e.target.value.slice(1), 16))} className="h-9 w-14 cursor-pointer rounded-lg border border-white/10 bg-transparent" aria-label="Kleur" />
      <span className="font-mono text-sm text-zinc-400">{hex.toUpperCase()}</span>
    </div>
  );
}

function PrimitiveInput({ name, value, onChange, server }: { name: string; value: string | number | boolean | null; onChange: (v: Json) => void; server: ServerInfo | null }) {
  if (typeof value === "boolean") return <Toggle checked={value} onChange={onChange} label={humanizeKey(name)} />;

  if (typeof value === "number") {
    if (/KLEUR/i.test(name)) return <ColorInput value={value} onChange={onChange} />;
    return (
      <input
        type="number"
        className={cn(inputClass, "sm:w-48")}
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
      />
    );
  }

  const text = value ?? "";
  const kind = idKind(name);
  if (kind && (text === "" || DISCORD_ID.test(text))) return <IdPicker kind={kind} value={text} onChange={onChange} server={server} />;
  if (TIME.test(text)) return <input type="time" className={cn(inputClass, "sm:w-36")} value={text} onChange={(e) => onChange(e.target.value)} />;
  if (text.length > 70 || text.includes("\n")) {
    return <textarea className={cn(inputClass, "min-h-24 font-mono text-xs")} value={text} onChange={(e) => onChange(e.target.value)} />;
  }
  return <input className={inputClass} value={text} onChange={(e) => onChange(e.target.value)} />;
}

function newItemLike(example: Json | undefined): Json {
  if (example === undefined || typeof example === "string") return "";
  if (typeof example === "number") return 0;
  if (typeof example === "boolean") return false;
  return JSON.parse(JSON.stringify(example)) as Json;
}

function ArrayEditor({ name, value, onChange, server, path }: { name: string; value: Json[]; onChange: (v: Json) => void; server: ServerInfo | null; path: string }) {
  const objects = value.length > 0 && value.every(isObject);
  const itemKind = idKind(name);

  const update = (i: number, v: Json) => onChange(value.map((x, j) => (j === i ? v : x)));
  const remove = (i: number) => onChange(value.filter((_, j) => j !== i));
  const add = () => onChange([...value, itemKind ? "" : newItemLike(value[value.length - 1])]);

  return (
    <div className="space-y-2">
      {value.length === 0 && <p className="text-sm text-zinc-500">Leeg</p>}
      {value.map((item, i) => (
        <div key={i} className={cn("flex items-start gap-2", objects && "rounded-2xl border border-white/10 bg-white/[0.02] p-3")}>
          <div className="min-w-0 flex-1">
            {objects ? (
              <ObjectFields value={item as JsonObject} onChange={(v) => update(i, v)} server={server} path={`${path}[${i}]`} />
            ) : (
              <PrimitiveInput name={itemKind ? name : `${name}_item`} value={item as string} onChange={(v) => update(i, v)} server={server} />
            )}
          </div>
          <button type="button" onClick={() => remove(i)} className="mt-1.5 rounded-lg p-1.5 text-zinc-500 hover:bg-rose-500/10 hover:text-rose-300" aria-label="Verwijderen">
            <Trash2 className="size-4" />
          </button>
        </div>
      ))}
      <button type="button" onClick={add} className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-white/15 px-3 py-1.5 text-sm text-zinc-400 hover:border-brand-500/50 hover:text-white">
        <Plus className="size-4" /> Toevoegen
      </button>
    </div>
  );
}

function ListObjectEditor({ value, onChange, server, path }: { value: JsonObject; onChange: (v: Json) => void; server: ServerInfo | null; path: string }) {
  const [newKey, setNewKey] = useState("");
  const keys = Object.keys(value);

  function add() {
    const key = newKey.trim().toLowerCase().replace(/[^\w-]/g, "");
    if (!key || key in value) return;
    onChange({ ...value, [key]: newItemLike(value[keys[0]]) });
    setNewKey("");
  }

  return (
    <div className="space-y-3">
      {keys.map((key) => (
        <Collapsible key={key} title={`${key}${isObject(value[key]) && typeof (value[key] as JsonObject).titel === "string" ? ` — ${(value[key] as JsonObject).titel}` : ""}`}>
          <ObjectFields value={value[key] as JsonObject} onChange={(v) => onChange({ ...value, [key]: v })} server={server} path={`${path}.${key}`} />
          <button
            type="button"
            onClick={() => {
              if (!window.confirm(`"${key}" verwijderen?`)) return;
              const copy = { ...value };
              delete copy[key];
              onChange(copy);
            }}
            className="mt-3 inline-flex items-center gap-1.5 text-sm text-rose-300 hover:text-rose-200"
          >
            <Trash2 className="size-4" /> {key} verwijderen
          </button>
        </Collapsible>
      ))}
      <div className="flex gap-2">
        <input className={cn(inputClass, "sm:w-60")} value={newKey} onChange={(e) => setNewKey(e.target.value)} placeholder="naam van nieuw item, bijv. hosting" />
        <button type="button" onClick={add} className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-white/15 px-3 text-sm text-zinc-400 hover:border-brand-500/50 hover:text-white">
          <Plus className="size-4" /> Toevoegen
        </button>
      </div>
    </div>
  );
}

function Collapsible({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02]">
      <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium" aria-expanded={open}>
        {open ? <ChevronDown className="size-4 text-zinc-400" /> : <ChevronRight className="size-4 text-zinc-400" />} {title}
      </button>
      {open && <div className="border-t border-white/10 p-4">{children}</div>}
    </div>
  );
}

function ObjectFields({ value, onChange, server, path }: { value: JsonObject; onChange: (v: Json) => void; server: ServerInfo | null; path: string }) {
  const isWeek = Object.keys(value).length > 0 && Object.keys(value).every((k) => /^[0-6]$/.test(k));
  return (
    <div className="space-y-4">
      {Object.entries(value).map(([key, v]) => (
        <Field
          key={key}
          name={key}
          label={isWeek ? DAYS[Number(key)] : humanizeKey(key)}
          value={v}
          onChange={(nv) => onChange({ ...value, [key]: nv })}
          server={server}
          path={`${path}.${key}`}
          nullableRange={isWeek}
        />
      ))}
    </div>
  );
}

export function Field({ name, label, value, onChange, server, path, nullableRange = false }: {
  name: string;
  label: string;
  value: Json;
  onChange: (v: Json) => void;
  server: ServerInfo | null;
  path: string;
  nullableRange?: boolean;
}) {
  // Opening hours: ["09:00", "22:00"] or null (closed)
  if (nullableRange) {
    const open = Array.isArray(value);
    return (
      <div className="flex flex-wrap items-center gap-3">
        <span className="w-28 text-sm font-medium text-zinc-300">{label}</span>
        <Toggle checked={open} onChange={(on) => onChange(on ? ["09:00", "17:00"] : null)} label={`${label} open`} />
        {open ? (
          <span className="flex items-center gap-2">
            <input type="time" className={cn(inputClass, "w-32")} value={String((value as Json[])[0] ?? "")} onChange={(e) => onChange([e.target.value, (value as Json[])[1] ?? ""])} />
            <span className="text-zinc-500">tot</span>
            <input type="time" className={cn(inputClass, "w-32")} value={String((value as Json[])[1] ?? "")} onChange={(e) => onChange([(value as Json[])[0] ?? "", e.target.value])} />
          </span>
        ) : (
          <span className="text-sm text-zinc-500">Gesloten</span>
        )}
      </div>
    );
  }

  let control: React.ReactNode;
  // File paths are set by the bot itself; changing them from the web could break it
  if (typeof value === "string" && /BESTAND$/i.test(name)) {
    control = <p className="break-all rounded-xl border border-white/5 bg-black/20 px-3 py-2 font-mono text-xs text-zinc-500">{value} (alleen-lezen)</p>;
  } else if (Array.isArray(value)) control = <ArrayEditor name={name} value={value} onChange={onChange} server={server} path={path} />;
  else if (isListObject(value)) control = <ListObjectEditor value={value} onChange={onChange} server={server} path={path} />;
  else if (isObject(value)) {
    control = Object.keys(value).length ? (
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <ObjectFields value={value} onChange={onChange} server={server} path={path} />
      </div>
    ) : (
      <JsonFallback value={value} onChange={onChange} />
    );
  } else control = <PrimitiveInput name={name} value={value} onChange={onChange} server={server} />;

  const inline = typeof value === "boolean";
  return (
    <div className={cn(inline ? "flex items-center justify-between gap-4" : "space-y-1.5")}>
      {label && (
        <label className="block text-sm font-medium text-zinc-300">
          {label}
          <span className="ml-2 font-mono text-[11px] font-normal text-zinc-600">{name}</span>
        </label>
      )}
      {control}
    </div>
  );
}

/** For empty objects (e.g. staff profiles) the structure is free, so it is edited as JSON. */
function JsonFallback({ value, onChange }: { value: Json; onChange: (v: Json) => void }) {
  const [text, setText] = useState(() => JSON.stringify(value, null, 2));
  const [error, setError] = useState("");
  return (
    <div className="space-y-1">
      <textarea
        className={cn(inputClass, "min-h-28 font-mono text-xs")}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          try {
            onChange(JSON.parse(e.target.value) as Json);
            setError("");
          } catch {
            setError("Ongeldige JSON");
          }
        }}
      />
      {error ? <p className="text-xs text-rose-300">{error}</p> : <p className="text-xs text-zinc-500">Vrije invulling in JSON-formaat.</p>}
    </div>
  );
}
