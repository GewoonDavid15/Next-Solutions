"use client";

import { Check, Printer } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

/** The checklist itself: tick items off (remembered in this browser) and print or save as PDF. */
export function ChecklistItems({ slug, items, labels }: { slug: string; items: { title: string; text: string }[]; labels: { done: string; print: string } }) {
  const key = `ns_checklist_${slug}`;
  const [done, setDone] = useState<number[]>([]);
  useEffect(() => {
    try { setDone(JSON.parse(localStorage.getItem(key) ?? "[]") as number[]); } catch { /* no storage */ }
  }, [key]);
  const toggle = (i: number) => setDone((d) => {
    const next = d.includes(i) ? d.filter((x) => x !== i) : [...d, i];
    try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* no storage */ }
    return next;
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <p className="text-sm text-zinc-400">{labels.done.replace("{n}", String(done.length)).replace("{t}", String(items.length))}</p>
        <Button variant="secondary" size="sm" onClick={() => window.print()}><Printer /> {labels.print}</Button>
      </div>
      <div className="mb-6 h-2 overflow-hidden rounded-full bg-white/10 print:hidden"><div className="h-full rounded-full bg-brand-gradient transition-all" style={{ width: `${(done.length / items.length) * 100}%` }} /></div>
      <ol className="space-y-3">
        {items.map((item, i) => {
          const checked = done.includes(i);
          return (
            <li key={item.title} className="break-inside-avoid">
              <label className={cn("flex cursor-pointer gap-4 rounded-2xl border p-4 transition print:border-zinc-300 print:bg-white", checked ? "border-brand-500/40 bg-brand-500/5" : "border-white/10 bg-white/[0.02] hover:border-white/20")}>
                <input type="checkbox" checked={checked} onChange={() => toggle(i)} className="peer sr-only" />
                <span aria-hidden className={cn("mt-0.5 grid size-6 shrink-0 place-items-center rounded-lg border peer-focus-visible:ring-2 peer-focus-visible:ring-brand-400 print:border-zinc-500", checked ? "border-brand-400 bg-brand-400 text-ink" : "border-white/25")}>{checked && <Check className="size-4" />}</span>
                <span>
                  <span className="block font-semibold text-white print:text-black">{i + 1}. {item.title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-zinc-400 print:text-zinc-700">{item.text}</span>
                </span>
              </label>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
