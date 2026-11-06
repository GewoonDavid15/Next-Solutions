import { ArrowRight, MailCheck } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChecklistItems } from "@/components/sections/ChecklistItems";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { checklistBySlug, checklists } from "@/lib/checklists";
import { getI18n } from "@/lib/i18n/server";

export function generateStaticParams() {
  return checklists.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = checklistBySlug(slug);
  return { title: c?.title.nl ?? "Checklist", robots: { index: false, follow: false } };
}

export default async function ChecklistPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ welkom?: string }> }) {
  const [{ slug }, { welkom }, { locale, lp }] = await Promise.all([params, searchParams, getI18n()]);
  const c = checklistBySlug(slug);
  if (!c) notFound();
  const en = locale === "en";

  return (
    <section className="pb-24 pt-32 sm:pt-40 print:pt-0">
      <div className="container max-w-3xl">
        {welkom && (
          <p role="status" className="mb-8 flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-100 print:hidden">
            <MailCheck className="mt-0.5 size-5 shrink-0" />
            {welkom === "mail"
              ? (en ? "Here is your checklist! We also emailed you the link, so you can find it again later." : "Hier is je checklist! We hebben je de link ook gemaild, zodat je hem later terugvindt.")
              : (en ? "Here is your checklist! Bookmark this page so you can find it again." : "Hier is je checklist! Zet deze pagina in je favorieten zodat je hem terugvindt.")}
          </p>
        )}
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-300 print:text-black">Next Solutions • {en ? "Checklist" : "Checklist"}</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl print:text-black"><span aria-hidden>{c.emoji} </span>{c.title[locale]}</h1>
        <p className="mb-8 mt-4 text-zinc-300 print:text-zinc-700">{c.intro[locale]}</p>
        <ChecklistItems
          slug={c.slug}
          items={c.items.map((i) => ({ title: i.title[locale], text: i.text[locale] }))}
          labels={{ done: en ? "{n} of {t} done" : "{n} van {t} afgevinkt", print: en ? "Print or save as PDF" : "Printen of opslaan als PDF" }}
        />
        <Card className="mt-10 p-6 sm:p-8 print:hidden">
          <h2 className="text-xl font-semibold">{en ? "Rather have us do it?" : "Liever dat wij het doen?"}</h2>
          <p className="mt-2 text-zinc-400">{en ? "We look at your situation with you and tell you honestly what will make the biggest difference." : "We kijken samen naar jouw situatie en zeggen eerlijk wat het meeste verschil maakt."}</p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button asChild><Link href={lp(`/diensten/${c.service}`)}>{en ? "View the service" : "Bekijk de dienst"} <ArrowRight /></Link></Button>
            <Button asChild variant="secondary"><Link href={lp("/contact")}>{en ? "Get in touch" : "Neem contact op"}</Link></Button>
          </div>
        </Card>
        <p className="mt-8 hidden text-xs text-zinc-600 print:block">nextsolutionshq.nl</p>
      </div>
    </section>
  );
}
