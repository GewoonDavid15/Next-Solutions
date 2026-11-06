"use client";

import { Copy, Crown, Minus, Plus, Search, ShieldAlert, Star, UserRound, Users, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Loading, Notice, Panel, inputClass } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/Button";
import { useBotData, timeAgo, dateTime, type ManagedRole, type MemberDetail, type MemberSummary, type Role } from "@/lib/beheer";
import { botApi } from "@/lib/dashboard";
import { cn } from "@/lib/utils";

function RoleChip({ role, onRemove }: { role: Role; onRemove?: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-xs">
      <span className="size-2 rounded-full" style={{ background: role.kleur ?? "#7D8494" }} />
      {role.naam}
      {onRemove && (
        <button type="button" onClick={onRemove} className="text-zinc-500 hover:text-rose-300" aria-label={`${role.naam} afnemen`}>
          <X className="size-3" />
        </button>
      )}
    </span>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-xs uppercase tracking-wide text-zinc-500">{title}</p>
      {children}
    </div>
  );
}

function Detail({ id, roles, onClose }: { id: string; roles: ManagedRole[]; onClose: () => void }) {
  const { data, error, setData } = useBotData<MemberDetail>(`beheer/lid?id=${id}`);
  const [addRole, setAddRole] = useState("");
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");

  async function changeRole(rolId: string, actie: "toevoegen" | "verwijderen") {
    setBusy(true);
    setActionError("");
    try {
      const { rollen } = await botApi<{ rollen: Role[] }>("POST", "beheer/lid/rol", { id, rolId, actie });
      setData((d) => (d ? { ...d, rollen } : d));
      setAddRole("");
    } catch (err) {
      setActionError((err as Error).message);
    }
    setBusy(false);
  }

  if (error) return <Notice>{error}</Notice>;
  if (!data) return <Loading />;
  const manageable = new Set(roles.filter((r) => r.beheerbaar).map((r) => r.id));
  const has = new Set(data.rollen.map((r) => r.id));
  const addable = roles.filter((r) => r.beheerbaar && !has.has(r.id) && !r.naam.startsWith("─"));

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-4">
        {data.avatar ? <Image src={data.avatar} alt="" width={64} height={64} className="size-16 rounded-2xl" unoptimized /> : <UserRound className="size-16 text-zinc-600" />}
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 truncate text-xl font-semibold">
            {data.naam} {data.beheerder && <Crown className="size-4 text-amber-300" aria-label="Beheerder" />}
          </p>
          <p className="truncate text-sm text-zinc-400">@{data.gebruikersnaam}{data.bot && " • bot"}</p>
          <button type="button" onClick={() => navigator.clipboard?.writeText(data.id)} className="mt-1 inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-white">
            <Copy className="size-3" /> {data.id}
          </button>
        </div>
        <button type="button" onClick={onClose} className="rounded-xl p-2 text-zinc-400 hover:bg-white/5 hover:text-white" aria-label="Sluiten">
          <X className="size-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl border border-white/10 p-3">
          <p className="text-xs text-zinc-500">Lid sinds</p>
          <p>{data.lidSinds ? dateTime(data.lidSinds) : "-"}</p>
        </div>
        <div className="rounded-2xl border border-white/10 p-3">
          <p className="text-xs text-zinc-500">Account aangemaakt</p>
          <p>{timeAgo(data.accountSinds)}</p>
        </div>
        <div className="rounded-2xl border border-white/10 p-3">
          <p className="text-xs text-zinc-500">Binnengekomen via</p>
          <p className="truncate">
            {data.binnenGekomen ? (data.binnenGekomen.door ? `invite van ${data.binnenGekomen.door}` : data.binnenGekomen.bron) : "onbekend"}
            {data.binnenGekomen?.nep && <span className="ml-1 text-xs text-amber-300">(verdacht)</span>}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 p-3">
          <p className="text-xs text-zinc-500">Eigen invites</p>
          <p>{data.invites ? `${data.invites.totaal}${data.invites.plek ? ` • #${data.invites.plek}` : ""}` : "-"}</p>
        </div>
      </div>
      {data.timeoutTot && data.timeoutTot > Date.now() && (
        <Notice>
          <ShieldAlert className="mr-1 inline size-4" /> Time-out tot {dateTime(data.timeoutTot)}
        </Notice>
      )}

      <Section title={`Rollen (${data.rollen.length})`}>
        <div className="flex flex-wrap gap-1.5">
          {data.rollen.map((r) => (
            <RoleChip key={r.id} role={r} onRemove={manageable.has(r.id) && !busy ? () => changeRole(r.id, "verwijderen") : undefined} />
          ))}
          {!data.rollen.length && <span className="text-sm text-zinc-500">Geen rollen</span>}
        </div>
        <div className="mt-2 flex gap-2">
          <select value={addRole} onChange={(e) => setAddRole(e.target.value)} className={inputClass} aria-label="Rol toevoegen">
            <option value="">Rol toevoegen…</option>
            {addable.map((r) => <option key={r.id} value={r.id}>{r.naam}</option>)}
          </select>
          <Button size="sm" disabled={!addRole || busy} onClick={() => changeRole(addRole, "toevoegen")} aria-label="Toevoegen">
            <Plus />
          </Button>
        </div>
        {actionError && <div className="mt-2"><Notice>{actionError}</Notice></div>}
        <p className="mt-1 text-[11px] text-zinc-500">Rollen met beheerdersrechten of boven de bot kun je alleen in Discord zelf aanpassen.</p>
      </Section>

      {(data.tickets.length > 0 || data.transcripts.length > 0) && (
        <Section title="Tickets">
          <ul className="space-y-1 text-sm">
            {data.tickets.map((t) => (
              <li key={t.id}><a href={t.link} target="_blank" rel="noreferrer" className="text-brand-300 hover:underline">{t.emoji} {t.naam}</a> <span className="text-xs text-emerald-300">open</span></li>
            ))}
            {data.transcripts.slice(0, 8).map((t) => (
              <li key={t.id} className="text-zinc-300">{t.emoji} {t.naam} <span className="text-xs text-zinc-500">• gesloten {timeAgo(t.gesloten)}</span></li>
            ))}
          </ul>
        </Section>
      )}
      {data.offertes.length > 0 && (
        <Section title="Offertes">
          <ul className="space-y-1 text-sm">
            {data.offertes.map((o) => <li key={o.nummer}>{o.statusEmoji} {o.nummer} • {o.titel} • {o.prijs} <span className="text-xs text-zinc-500">({o.status})</span></li>)}
          </ul>
        </Section>
      )}
      {data.projecten.length > 0 && (
        <Section title="Projecten">
          <ul className="space-y-1 text-sm">{data.projecten.map((p) => <li key={p.id}>{p.faseEmoji} {p.naam} • {p.percentage}%</li>)}</ul>
        </Section>
      )}
      {data.reviews.length > 0 && (
        <Section title="Reviews">
          <ul className="space-y-1 text-sm">
            {data.reviews.map((r) => (
              <li key={r.t} className="text-zinc-300">
                <span className="text-amber-300">{Array.from({ length: r.sterren }, (_, i) => <Star key={i} className="inline size-3 fill-current" />)}</span> {r.tekst || <i className="text-zinc-500">geen tekst</i>}
              </li>
            ))}
          </ul>
        </Section>
      )}
      {(data.sollicitaties.length > 0 || data.bugs.length > 0) && (
        <Section title="Overig">
          <ul className="space-y-1 text-sm text-zinc-300">
            {data.sollicitaties.map((s) => <li key={s.id}>{s.statusEmoji} Sollicitatie: {s.titel} ({s.status})</li>)}
            {data.bugs.map((b) => <li key={b.nr}>{b.statusEmoji} Bug #{b.nr}: {b.titel}</li>)}
          </ul>
        </Section>
      )}
    </div>
  );
}

export function MembersTab() {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [role, setRole] = useState("");
  const [sort, setSort] = useState("nieuw");
  const [selected, setSelected] = useState<string | null>(null);
  const roles = useBotData<{ rollen: ManagedRole[] }>("beheer/rollen");

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const params = new URLSearchParams({ q: debounced, sorteer: sort, ...(role ? { rol: role } : {}) });
  const members = useBotData<{ totaal: number; leden: MemberSummary[] }>(`beheer/leden?${params}`);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_minmax(0,420px)]">
      <Panel title={`Leden${members.data ? ` • ${members.data.totaal}` : ""}`} icon={Users} className={cn(selected && "hidden lg:block")}>
        <div className="mb-3 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Zoek op naam, gebruikersnaam of ID" className={cn(inputClass, "pl-9")} />
          </div>
          <select value={role} onChange={(e) => setRole(e.target.value)} className={inputClass} aria-label="Filter op rol">
            <option value="">Alle rollen</option>
            {roles.data?.rollen.filter((r) => !r.naam.startsWith("─")).map((r) => <option key={r.id} value={r.id}>{r.naam} ({r.leden})</option>)}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className={inputClass} aria-label="Sorteren">
            <option value="nieuw">Nieuwste eerst</option>
            <option value="oud">Oudste eerst</option>
            <option value="naam">Naam A-Z</option>
          </select>
        </div>
        {members.error && <Notice>{members.error}</Notice>}
        {members.loading && !members.data && <Loading />}
        <div className="divide-y divide-white/5">
          {members.data?.leden.map((m) => (
            <button key={m.id} type="button" onClick={() => setSelected(m.id)} className={cn("flex w-full items-center gap-3 px-1 py-2.5 text-left transition hover:bg-white/[0.03]", selected === m.id && "bg-brand-600/10")}>
              {m.avatar ? <Image src={m.avatar} alt="" width={36} height={36} className="size-9 rounded-full" unoptimized /> : <UserRound className="size-9 text-zinc-600" />}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{m.naam} {m.bot && <span className="rounded bg-white/10 px-1 text-[10px]">BOT</span>}</span>
                <span className="block truncate text-xs text-zinc-500">@{m.gebruikersnaam} • lid {m.lidSinds ? timeAgo(m.lidSinds) : "-"}</span>
              </span>
              <span className="hidden max-w-[45%] flex-wrap justify-end gap-1 md:flex">
                {m.rollen.slice(0, 3).map((r) => <RoleChip key={r.id} role={r} />)}
                {m.rollen.length > 3 && <span className="text-xs text-zinc-500">+{m.rollen.length - 3}</span>}
              </span>
            </button>
          ))}
        </div>
        {members.data && members.data.totaal > members.data.leden.length && (
          <p className="mt-3 text-center text-xs text-zinc-500">
            <Minus className="mr-1 inline size-3" /> {members.data.leden.length} van {members.data.totaal} getoond. Zoek specifieker om anderen te vinden.
          </p>
        )}
      </Panel>
      <Panel className={cn(!selected && "hidden lg:block")}>
        {selected ? (
          <>
            <button type="button" onClick={() => setSelected(null)} className="mb-3 text-sm text-zinc-400 hover:text-white lg:hidden">← Terug</button>
            <Detail key={selected} id={selected} roles={roles.data?.rollen ?? []} onClose={() => setSelected(null)} />
          </>
        ) : (
          <div className="grid h-64 place-items-center text-center text-sm text-zinc-500">
            <div>
              <UserRound className="mx-auto mb-3 size-8 text-zinc-600" />
              Kies een lid voor alle informatie: rollen, invites, tickets, offertes en meer.
            </div>
          </div>
        )}
      </Panel>
    </div>
  );
}
