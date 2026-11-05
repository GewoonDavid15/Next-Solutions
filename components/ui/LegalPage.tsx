import { Info } from "lucide-react";
import { FadeUp } from "@/components/motion/FadeUp";
import { PageHeader } from "@/components/ui/PageHeader";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

export interface LegalSection {
  heading: string;
  paragraphs?: string[];
  list?: string[];
}

interface LegalPageProps {
  eyebrow: string;
  title: React.ReactNode;
  description: string;
  updated: string;
  sections: LegalSection[];
  locale?: Locale;
}

/** Shared layout for the privacy policy and terms pages. */
export function LegalPage({ eyebrow, title, description, updated, sections, locale = "nl" }: LegalPageProps) {
  const en = locale === "en";
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} description={description} />

      <section className="pb-12">
        <div className="container max-w-3xl">
          <FadeUp>
            {en && (
              <p className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-zinc-400">
                <Info className="mt-0.5 size-4 shrink-0 text-brand-300" />
                <span>This is a translation of the Dutch text, provided for convenience. If the two differ, the Dutch version prevails.</span>
              </p>
            )}
            <p className={cn("text-sm text-zinc-500", en && "mt-4")}>{en ? "Last updated" : "Laatst bijgewerkt"}: {updated}</p>
          </FadeUp>

          <div className="mt-10 space-y-10">
            {sections.map((section, i) => (
              <FadeUp key={section.heading} delay={i * 0.04}>
                <h2 className="text-xl font-semibold sm:text-2xl">{section.heading}</h2>
                {section.paragraphs?.map((p) => (
                  <p key={p} className="mt-3 leading-relaxed text-zinc-400">
                    {p}
                  </p>
                ))}
                {section.list && (
                  <ul className="mt-3 space-y-2">
                    {section.list.map((item) => (
                      <li key={item} className="flex gap-3 leading-relaxed text-zinc-400">
                        <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-brand-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </FadeUp>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
