"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface FaqAccordionProps {
  items: { question: string; answer: string }[];
  className?: string;
}

/** Accessible FAQ accordion with an animated open/close transition. */
export function FaqAccordion({ items, className }: FaqAccordionProps) {
  return (
    <AccordionPrimitive.Root type="single" collapsible className={cn("space-y-3", className)}>
      {items.map((item, i) => (
        <AccordionPrimitive.Item
          key={i}
          value={`item-${i}`}
          className="glass overflow-hidden rounded-3xl transition-colors data-[state=open]:border-brand-500/40"
        >
          <AccordionPrimitive.Header>
            <AccordionPrimitive.Trigger className="group flex w-full items-center justify-between gap-4 p-5 text-left sm:p-6">
              <span className="font-display text-base text-white sm:text-lg">{item.question}</span>
              <Plus className="size-5 shrink-0 text-brand-400 transition-transform duration-300 group-data-[state=open]:rotate-45" />
            </AccordionPrimitive.Trigger>
          </AccordionPrimitive.Header>
          <AccordionPrimitive.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
            <p className="px-5 pb-5 text-sm leading-relaxed text-zinc-400 sm:px-6 sm:pb-6">{item.answer}</p>
          </AccordionPrimitive.Content>
        </AccordionPrimitive.Item>
      ))}
    </AccordionPrimitive.Root>
  );
}
