import { ArrowLeft, Check, Lock } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FadeUp } from "@/components/motion/FadeUp";
import { ChecklistForm } from "@/components/sections/ChecklistForm";
import { Card } from "@/components/ui/Card";
import { checklistBySlug, checklists } from "@/lib/checklists";
import { getI18n, pageMetadata } from "@/lib/i18n/server";

export function generateStaticParams() {
  return checklists.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const [{ slug }, { locale }] = await Promise.all([params, getI18n()]);
  const c = checklistBySlug(slug);
  if (!c) return {};
  return pageMetadata(`/gratis/${slug}`, `${locale === "en" ? "Free checklist" : "Gratis checklist"}: ${c.title[locale]}`, c.intro[locale]);
}

export default async function ChecklistLanding({ params }: { params: Promise<{ slug: string }> }) {
  const [{ slug }, { locale, lp }] = await Promise.all([params, getI18n()]);
  const c = checklistBySlug(slug);
  if (!c) notFound();
  const en = locale === "en";
  const preview = c.items.slice(0, 3);

  return (
    <section className="relative overflow-hidden pb-24 pt-32 sm:pt-40">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-16 size-[480px] -translate-x-1/2 rounded-full bg-brand-500/10 blur-3xl" />
      <div className="container relative max-w-5xl">
        <Link href={lp("/gratis")} className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"><ArrowLeft className="size-4" /> {en ? "All checklists" : "Alle checklists"}</Link>
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
          <FadeUp>
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-300">{en ? "Free checklist" : "Gratis checklist"}</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl"><span aria-hidden>{c.emoji} </span>{c.title[locale]}</h1>
            <p className="mt-5 text-lg leading-relaxed text-zinc-300">{c.intro[locale]}</p>
            <p className="mt-3 text-sm text-zinc-400"><b className="text-zinc-200">{en ? "For: " : "Voor: "}</b>{c.forWho[locale]}</p>
            <ul className="mt-8 space-y-3">
              {preview.map((item) => (
                <li key={item.title.nl} className="flex gap-3"><Check className="mt-0.5 size-5 shrink-0 text-brand-300" /><span><b className="text-white">{item.title[locale]}</b><span className="block text-sm text-zinc-400">{item.text[locale]}</span></span></li>
              ))}
              <li className="flex gap-3 text-zinc-400"><Lock className="mt-0.5 size-5 shrink-0" /> {en ? `And ${c.items.length - preview.length} more points, with what to do about each one.` : `En nog ${c.items.length - preview.length} punten, met bij elk wat je eraan doet.`}</li>
            </ul>
          </FadeUp>
          <FadeUp delay={0.1}>
            <Card className="p-6 sm:p-8 lg:sticky lg:top-28">
              <h2 className="text-xl font-semibold">{en ? "Get the full checklist" : "Ontvang de volledige checklist"}</h2>
              <p className="mb-5 mt-1 text-sm text-zinc-400">{en ? "Opens right away, and we email you the link so you have it later too." : "Opent meteen, en we mailen je de link zodat je hem later ook nog hebt."}</p>
              <ChecklistForm slug={c.slug} />
            </Card>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
