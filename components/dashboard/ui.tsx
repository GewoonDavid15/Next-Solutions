"use client";

import { AlertCircle, Check, Loader2, Power } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { botApi, type Overview } from "@/lib/dashboard";
import { cn } from "@/lib/utils";

export function Panel({ title, icon: Icon, actions, className, children }: {
  title?: string;
  icon?: React.ComponentType<{ className?: string }>;
  actions?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("glass rounded-3xl p-5 sm:p-6", className)}>
      {(title || actions) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          {title && (
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              {Icon && <Icon className="size-5 text-brand-300" />} {title}
            </h2>
          )}
          {actions}
        </div>
      )}
      {children}
    </div>
  );
}

export function Notice({ kind = "error", children }: { kind?: "error" | "success" | "info"; children: React.ReactNode }) {
  const styles = {
    error: "border-rose-500/30 bg-rose-500/10 text-rose-200",
    success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
    info: "border-brand-500/30 bg-brand-600/10 text-brand-100",
  };
  const Icon = kind === "success" ? Check : AlertCircle;
  return (
    <p role={kind === "error" ? "alert" : "status"} className={cn("flex items-start gap-2 rounded-2xl border p-3 text-sm", styles[kind])}>
      <Icon className="mt-0.5 size-4 shrink-0" /> <span className="min-w-0 break-words">{children}</span>
    </p>
  );
}

export function Loading({ label = "Laden..." }: { label?: string }) {
  return (
    <p className="flex items-center gap-2 py-8 text-sm text-zinc-400">
      <Loader2 className="size-4 animate-spin" /> {label}
    </p>
  );
}

export function Toggle({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition disabled:opacity-50",
        checked ? "border-brand-500/60 bg-brand-600" : "border-white/15 bg-white/10",
      )}
    >
      <span className={cn("inline-block size-4 rounded-full bg-white shadow transition", checked ? "translate-x-6" : "translate-x-1")} />
    </button>
  );
}

export const inputClass =
  "w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-brand-500/60 focus:outline-none focus:ring-2 focus:ring-brand-500/30";

/** Restart button: asks for confirmation, restarts the bot and waits until it is back online. */
export function RestartButton({ size = "sm" }: { size?: "sm" | "md" }) {
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function restart() {
    if (!window.confirm("De bot herstarten? Hij is dan ongeveer 10-30 seconden offline.")) return;
    setState("busy");
    setMessage("Bot wordt herstart...");
    try {
      await botApi("POST", "acties/herstart");
    } catch (err) {
      setState("error");
      setMessage((err as Error).message);
      return;
    }
    const started = Date.now();
    await new Promise((r) => setTimeout(r, 4000));
    while (Date.now() - started < 120_000) {
      try {
        const o = await botApi<Overview>("GET", "overzicht");
        if (o.bot.online && o.bot.opgestartOp > started) {
          setState("done");
          setMessage("De bot is weer online.");
          return;
        }
      } catch {
        // Still restarting
      }
      await new Promise((r) => setTimeout(r, 3000));
    }
    setState("error");
    setMessage("De bot is na 2 minuten nog niet terug. Staat 'automatisch herstarten' aan in Craftnode?");
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button type="button" size={size} variant="secondary" onClick={restart} disabled={state === "busy"}>
        {state === "busy" ? <Loader2 className="animate-spin" /> : <Power />} Bot herstarten
      </Button>
      {message && (
        <span className={cn("text-sm", state === "error" ? "text-rose-300" : state === "done" ? "text-emerald-300" : "text-zinc-400")}>{message}</span>
      )}
    </div>
  );
}

export function SetupNotice() {
  return (
    <Panel className="mt-8" title="Koppel je bot" icon={Power}>
      <p className="text-sm text-zinc-300">Het dashboard is nog niet met je bot verbonden. Zo stel je het in:</p>
      <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-zinc-400">
        <li>
          Zet <code className="text-brand-200">dashboard-api.js</code> in de map <code className="text-brand-200">Systeem</code> van je bot en gebruik de nieuwste{" "}
          <code className="text-brand-200">index.js</code>.
        </li>
        <li>
          Maak een lange willekeurige sleutel (minimaal 32 tekens) en zet die in de <code className="text-brand-200">.env</code> van je bot als{" "}
          <code className="text-brand-200">DASHBOARD_SECRET</code>, met de poort van Craftnode als <code className="text-brand-200">DASHBOARD_PORT</code>.
        </li>
        <li>
          Zet op de website <code className="text-brand-200">BOT_API_URL</code> (bijv. <code className="text-brand-200">http://123.45.67.89:25565</code>) en{" "}
          <code className="text-brand-200">BOT_API_SECRET</code> (dezelfde sleutel).
        </li>
        <li>Herstart de bot en vernieuw deze pagina.</li>
      </ol>
    </Panel>
  );
}
