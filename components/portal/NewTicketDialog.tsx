"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Loader2, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { createTicket, type TicketFormState } from "@/app/klantportaal/actions";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import type { PortalProject } from "@/lib/portal";
import { cn } from "@/lib/utils";

const priorityOptions = [
  { value: "LOW", label: "Laag" },
  { value: "NORMAL", label: "Normaal" },
  { value: "HIGH", label: "Hoog" },
];

const initialState: TicketFormState = { status: "idle" };

export function NewTicketDialog({ projects, disabled }: { projects: PortalProject[]; disabled?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createTicket, initialState);
  const [priority, setPriority] = useState("NORMAL");
  const [projectId, setProjectId] = useState("");
  /** "form" until a submit succeeds; useActionState keeps its last value, so the
   *  view is tracked separately to reset cleanly when the dialog is reopened. */
  const [view, setView] = useState<"form" | "success">("form");
  /** Reference of the last success handled here. Refreshing re-renders this
   *  component and reopening keeps the old action state, so without this the
   *  effect would fire again and the dialog would never settle. */
  const handled = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (state.status !== "success" || !state.reference || state.reference === handled.current) return;
    handled.current = state.reference;
    setView("success");
    router.refresh();
    const timer = setTimeout(() => setOpen(false), 2200);
    return () => clearTimeout(timer);
  }, [state, router]);

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setView("form");
      setPriority("NORMAL");
      setProjectId("");
    }
  }

  const projectOptions = [
    { value: "", label: "Geen specifiek project" },
    ...projects.map((p) => ({ value: p.id, label: `${p.name} (${p.id})` })),
  ];

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Trigger asChild>
        <Button variant="secondary" size="sm" disabled={disabled} title={disabled ? "Beschikbaar zodra je account gekoppeld is" : undefined}>
          <Plus /> Nieuw ticket
        </Button>
      </DialogPrimitive.Trigger>

      <AnimatePresence>
        {open && (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm"
              />
            </DialogPrimitive.Overlay>

            <DialogPrimitive.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: 8 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="fixed left-1/2 top-1/2 z-[85] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-white/10 bg-ink-800/95 p-6 shadow-glow-lg backdrop-blur-xl sm:p-8"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <DialogPrimitive.Title className="font-display text-2xl font-semibold text-white">
                      Nieuw ticket
                    </DialogPrimitive.Title>
                    <DialogPrimitive.Description className="mt-1 text-sm text-zinc-400">
                      Beschrijf je vraag of probleem. We pakken het meestal binnen een paar uur op.
                    </DialogPrimitive.Description>
                  </div>
                  <DialogPrimitive.Close asChild>
                    <button aria-label="Sluiten" className="grid size-9 shrink-0 place-items-center rounded-xl text-zinc-400 transition hover:bg-white/5 hover:text-white">
                      <X className="size-5" />
                    </button>
                  </DialogPrimitive.Close>
                </div>

                {view === "success" ? (
                  <div className="mt-8 flex flex-col items-center gap-3 py-6 text-center">
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 260, damping: 16 }}
                      className="grid size-14 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-300"
                    >
                      <CheckCircle2 className="size-7" />
                    </motion.span>
                    <p className="font-display text-lg text-white">
                      Ticket {state.reference} aangemaakt
                    </p>
                    <p className="text-sm text-zinc-400">{state.message}</p>
                  </div>
                ) : (
                  <form action={formAction} className="mt-6 space-y-5">
                    <div>
                      <label htmlFor="subject" className="mb-2 block font-display text-sm text-zinc-200">
                        Onderwerp
                      </label>
                      <input
                        id="subject"
                        name="subject"
                        required
                        maxLength={200}
                        autoComplete="off"
                        placeholder="Bijvoorbeeld: extra commando voor rollenbeheer"
                        className={cn(
                          "h-12 w-full rounded-2xl border bg-white/[0.03] px-4 text-sm text-white placeholder:text-zinc-500 transition-colors hover:border-brand-500/40 focus:border-brand-500 focus:outline-none",
                          state.errors?.subject ? "border-rose-500/60" : "border-white/10",
                        )}
                      />
                      {state.errors?.subject && <p className="mt-2 text-xs text-rose-300">{state.errors.subject}</p>}
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label htmlFor="priority" className="mb-2 block font-display text-sm text-zinc-200">
                          Prioriteit
                        </label>
                        <Select
                          id="priority"
                          value={priority}
                          onValueChange={setPriority}
                          placeholder="Kies een prioriteit"
                          options={priorityOptions}
                        />
                        <input type="hidden" name="priority" value={priority} />
                      </div>
                      <div>
                        <label htmlFor="projectId" className="mb-2 block font-display text-sm text-zinc-200">
                          Project
                        </label>
                        <Select
                          id="projectId"
                          value={projectId}
                          onValueChange={setProjectId}
                          placeholder="Geen specifiek project"
                          options={projectOptions}
                        />
                        <input type="hidden" name="projectId" value={projectId} />
                      </div>
                    </div>

                    {state.status === "error" && state.message && (
                      <p role="alert" className="flex items-start gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
                        <AlertCircle className="mt-0.5 size-4 shrink-0" /> {state.message}
                      </p>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                      <DialogPrimitive.Close asChild>
                        <Button type="button" variant="ghost">
                          Annuleren
                        </Button>
                      </DialogPrimitive.Close>
                      <Button type="submit" disabled={pending}>
                        {pending ? (
                          <>
                            <Loader2 className="animate-spin" /> Versturen…
                          </>
                        ) : (
                          "Ticket aanmaken"
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}
