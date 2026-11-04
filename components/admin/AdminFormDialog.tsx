"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Loader2, X } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import type { ActionResult } from "@/app/beheer/actions";
import { cn } from "@/lib/utils";

export interface Field {
  name: string;
  label: string;
  placeholder?: string;
  hint?: string;
  required?: boolean;
  type?: "text" | "email" | "date" | "select";
  options?: { value: string; label: string }[];
}

interface AdminFormDialogProps {
  trigger: React.ReactNode;
  title: string;
  description: string;
  submitLabel: string;
  fields: Field[];
  action: (formData: FormData) => Promise<ActionResult>;
  onDone: () => void;
  disabled?: boolean;
  disabledReason?: string;
}

/** Shared "create something" dialog for the admin panel. */
export function AdminFormDialog({
  trigger,
  title,
  description,
  submitLabel,
  fields,
  action,
  onDone,
  disabled,
  disabledReason,
}: AdminFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError("");
    startTransition(async () => {
      const result = await action(formData);
      if (result.ok) {
        setOpen(false);
        onDone();
      } else {
        setError(result.message ?? "Er ging iets mis.");
      }
    });
  }

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setError("");
      }}
    >
      <DialogPrimitive.Trigger asChild>
        <Button variant="secondary" size="sm" disabled={disabled} title={disabled ? disabledReason : undefined}>
          {trigger}
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
                initial={{ opacity: 0, scale: 0.95, x: "-50%", y: "-46%" }}
                animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
                exit={{ opacity: 0, scale: 0.97, x: "-50%", y: "-48%" }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="fixed left-1/2 top-1/2 max-h-[90svh] overflow-y-auto z-[85] max-h-[90svh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-3xl border border-white/10 bg-ink-800/95 p-6 shadow-glow-lg backdrop-blur-xl sm:p-8"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <DialogPrimitive.Title className="font-display text-2xl font-semibold text-white">
                      {title}
                    </DialogPrimitive.Title>
                    <DialogPrimitive.Description className="mt-1 text-sm text-zinc-400">
                      {description}
                    </DialogPrimitive.Description>
                  </div>
                  <DialogPrimitive.Close asChild>
                    <button
                      aria-label="Sluiten"
                      className="grid size-9 shrink-0 place-items-center rounded-xl text-zinc-400 transition hover:bg-white/5 hover:text-white"
                    >
                      <X className="size-5" />
                    </button>
                  </DialogPrimitive.Close>
                </div>

                <form onSubmit={onSubmit} className="mt-6 space-y-5">
                  {fields.map((field) => (
                    <div key={field.name}>
                      <label htmlFor={field.name} className="mb-2 block font-display text-sm text-zinc-200">
                        {field.label}
                      </label>
                      {field.type === "select" ? (
                        <select
                          id={field.name}
                          name={field.name}
                          required={field.required}
                          defaultValue=""
                          className={inputClass}
                        >
                          <option value="" disabled className="bg-ink-800">
                            Maak een keuze
                          </option>
                          {field.options?.map((o) => (
                            <option key={o.value} value={o.value} className="bg-ink-800">
                              {o.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          id={field.name}
                          name={field.name}
                          type={field.type ?? "text"}
                          required={field.required}
                          placeholder={field.placeholder}
                          autoComplete="off"
                          className={cn(inputClass, field.type === "date" && "[color-scheme:dark]")}
                        />
                      )}
                      {field.hint && <p className="mt-1.5 text-xs text-zinc-500">{field.hint}</p>}
                    </div>
                  ))}

                  {error && (
                    <p
                      role="alert"
                      className="flex items-start gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200"
                    >
                      <AlertCircle className="mt-0.5 size-4 shrink-0" /> {error}
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
                          <Loader2 className="animate-spin" /> Opslaan…
                        </>
                      ) : (
                        submitLabel
                      )}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}

const inputClass =
  "h-12 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white placeholder:text-zinc-500 transition-colors hover:border-brand-500/40 focus:border-brand-500 focus:outline-none";
