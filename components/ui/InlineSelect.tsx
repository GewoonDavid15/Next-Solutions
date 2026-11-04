"use client";

import { cn } from "@/lib/utils";

interface InlineSelectProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  className?: string;
}

/**
 * Compact native select for editing a value straight in a table row.
 * Native on purpose: it is keyboard- and screen-reader-friendly out of the box,
 * and sits in a scrollable table where a floating menu would be awkward.
 */
export function InlineSelect({ label, value, options, onChange, className }: InlineSelectProps) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "h-9 rounded-xl border border-white/10 bg-white/[0.03] px-3 text-sm text-white transition-colors hover:border-brand-500/40 focus:border-brand-500 focus:outline-none",
        className,
      )}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} className="bg-ink-800 text-white">
          {o.label}
        </option>
      ))}
    </select>
  );
}
