"use client";

import { CheckCircle2, Loader2, Mail } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { ClientEmailStatus } from "@/lib/live";
import { cn } from "@/lib/utils";

/** Email notifications in the client portal: opt in with a confirmation mail, choose which ones, opt out. */
export function EmailSettings({ initial }: { initial: ClientEmailStatus }) {
  const [status, setStatus] = useState(initial);
  const [email, setEmail] = useState(initial.email ?? "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  async function call(body: object) {
    setBusy(true);
    setMessage(null);
    const res = await fetch("/api/portaal/email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
    const data = ((await res?.json().catch(() => null)) ?? {}) as { fout?: string };
    setBusy(false);
    if (!res?.ok) setMessage({ kind: "error", text: data.fout ?? "Er ging iets mis." });
    return Boolean(res?.ok);
  }

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    if (await call({ actie: "aanmelden", email })) {
      setStatus({ ...status, email, bevestigd: false });
      setMessage({ kind: "ok", text: `We hebben een bevestigingsmail gestuurd naar ${email}. Klik op de knop in die mail.` });
    }
  }

  async function unsubscribe() {
    if (!window.confirm("Alle e-mailmeldingen uitzetten? Je e-mailadres wordt dan verwijderd.")) return;
    if (await call({ actie: "afmelden" })) {
      setStatus({ ...status, email: null, bevestigd: false });
      setEmail("");
      setMessage({ kind: "ok", text: "Je bent afgemeld en je e-mailadres is verwijderd." });
    }
  }

  async function toggle(type: string, on: boolean) {
    const voorkeuren = { ...status.voorkeuren, [type]: on };
    setStatus({ ...status, voorkeuren });
    if (!(await call({ actie: "voorkeuren", voorkeuren }))) setStatus(status);
  }

  if (!status.beschikbaar) return null;

  return (
    <div className="glass rounded-3xl p-6">
      <h2 className="flex items-center gap-2 text-xl font-semibold"><Mail className="size-5 text-brand-300" /> E-mailmeldingen</h2>
      <p className="mt-1 text-sm text-zinc-400">Naast een DM van onze bot kun je updates ook per e-mail krijgen.</p>

      {status.email && status.bevestigd ? (
        <div className="mt-4 space-y-4">
          <p className="flex items-center gap-2 text-sm text-emerald-300"><CheckCircle2 className="size-4" /> Aan voor {status.email}</p>
          <ul className="space-y-2">
            {Object.entries(status.soorten).map(([type, label]) => (
              <li key={type} className="flex items-center justify-between gap-4 text-sm text-zinc-300">
                {label}
                <button
                  type="button"
                  role="switch"
                  aria-checked={status.voorkeuren[type] !== false}
                  aria-label={label}
                  disabled={busy}
                  onClick={() => toggle(type, status.voorkeuren[type] === false)}
                  className={cn("relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition disabled:opacity-50", status.voorkeuren[type] !== false ? "border-brand-500/60 bg-brand-600" : "border-white/15 bg-white/10")}
                >
                  <span className={cn("inline-block size-4 rounded-full bg-white transition", status.voorkeuren[type] !== false ? "translate-x-6" : "translate-x-1")} />
                </button>
              </li>
            ))}
          </ul>
          <button type="button" onClick={unsubscribe} disabled={busy} className="text-sm text-zinc-400 underline hover:text-white">Alle e-mailmeldingen uitzetten</button>
        </div>
      ) : (
        <form onSubmit={subscribe} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jouw@email.nl"
            aria-label="E-mailadres"
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-brand-500/60 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          />
          <Button type="submit" size="sm" disabled={busy} className="h-11 shrink-0">
            {busy ? <Loader2 className="animate-spin" /> : <Mail />} {status.email ? "Opnieuw versturen" : "Aanzetten"}
          </Button>
        </form>
      )}
      {status.email && !status.bevestigd && !message && <p className="mt-3 text-sm text-amber-300">Wacht op bevestiging: kijk in de inbox (of spam) van {status.email}.</p>}
      {message && <p role={message.kind === "error" ? "alert" : "status"} className={cn("mt-3 text-sm", message.kind === "error" ? "text-rose-300" : "text-emerald-300")}>{message.text}</p>}
    </div>
  );
}
