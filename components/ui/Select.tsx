"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectProps {
  id?: string;
  value: string;
  onValueChange: (v: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
  invalid?: boolean;
}

/** Accessible dropdown built on Radix Select, styled for the dark glass theme. */
export function Select({ id, value, onValueChange, placeholder, options, invalid }: SelectProps) {
  return (
    <SelectPrimitive.Root value={value || undefined} onValueChange={onValueChange}>
      <SelectPrimitive.Trigger
        id={id}
        aria-invalid={invalid}
        className={cn(
          "flex h-12 w-full items-center justify-between rounded-2xl border bg-white/[0.03] px-4 text-left text-sm text-white transition-colors data-[placeholder]:text-zinc-500 hover:border-brand-500/40 focus:border-brand-500",
          invalid ? "border-rose-500/60" : "border-white/10",
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon>
          <ChevronDown className="size-4 text-zinc-400" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={8}
          className="z-[70] max-h-72 w-[var(--radix-select-trigger-width)] overflow-hidden rounded-2xl border border-white/10 bg-ink-800/95 p-1.5 shadow-glow backdrop-blur-xl"
        >
          <SelectPrimitive.Viewport>
            {options.map((o) => (
              <SelectPrimitive.Item
                key={o.value}
                value={o.value}
                className="relative flex cursor-pointer select-none items-center rounded-xl py-2.5 pl-9 pr-3 text-sm text-zinc-300 outline-none data-[highlighted]:bg-brand-600/20 data-[highlighted]:text-white"
              >
                <SelectPrimitive.ItemIndicator className="absolute left-3">
                  <Check className="size-4 text-brand-400" />
                </SelectPrimitive.ItemIndicator>
                <SelectPrimitive.ItemText>{o.label}</SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
