import { ArrowRight, Check, Minus, ThumbsUp } from "lucide-react";
import Link from "next/link";
import { FadeUp } from "@/components/motion/FadeUp";
import { FaqSchema } from "@/components/StructuredData";
import { CallToAction } from "@/components/sections/CallToAction";
import { FaqAccordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getI18n, pageMetadata } from "@/lib/i18n/server";

type L = { nl: string; en: string };

const rows: { topic: L; diy: L; us: L }[] = [
  { topic: { nl: "Tijd", en: "Time" }, diy: { nl: "Uitzoeken, maken, testen en bijhouden kost je wekelijks uren die niet naar je eigen werk gaan.", en: "Figuring out, building, testing and maintaining costs you hours every week that do not go into your own work." }, us: { nl: "Jij geeft de richting aan, wij doen het werk. Je houdt tijd over voor je klanten.", en: "You set the direction, we do the work. You keep time for your customers." } },
  { topic: { nl: "Kennis", en: "Know-how" }, diy: { nl: "Je leert alles zelf, met vallen en opstaan. Wat werkt, verandert ook nog steeds.", en: "You learn everything yourself, by trial and error. And what works keeps changing." }, us: { nl: "We doen dit dagelijks en weten wat er nu werkt op Discord, social media en het web.", en: "We do this every day and know what works right now on Discord, social media and the web." } },
  { topic: { nl: "Kwaliteit en uitstraling", en: "Quality and look" }, diy: { nl: "Afhankelijk van je ervaring. Vaak 'goed genoeg', maar niet altijd professioneel.", en: "Depends on your experience. Often 'good enough', but not always professional." }, us: { nl: "Eén herkenbare stijl, getest op mobiel en snel. Gemaakt om resultaat te halen.", en: "One recognisable style, tested on mobile and fast. Built to get results." } },
  { topic: { nl: "Volhouden", en: "Consistency" }, diy: { nl: "Als het druk wordt, schiet het er als eerste bij in. Posts blijven liggen, updates ook.", en: "When things get busy, it is the first thing to slip. Posts and updates pile up." }, us: { nl: "Een vaste planning die doorloopt, ook als jij het druk hebt.", en: "A fixed schedule that keeps running, even when you are busy." } },
  { topic: { nl: "Kosten", en: "Cost" }, diy: { nl: "Geen factuur, wel je eigen uren, losse tools en abonnementen.", en: "No invoice, but your own hours, separate tools and subscriptions." }, us: { nl: "Een vaste prijs vooraf, zonder verrassingen. Je weet precies waar je aan toe bent.", en: "A fixed price up front, without surprises. You know exactly where you stand." } },
  { topic: { nl: "Als er iets misgaat", en: "When something breaks" }, diy: { nl: "Zelf zoeken naar de oorzaak, vaak op het slechtste moment.", en: "Finding the cause yourself, often at the worst moment." }, us: { nl: "Je opent een ticket en wij lossen het op. Je volgt alles in je klantportaal.", en: "You open a ticket and we fix it. You follow everything in your client portal." } },
  { topic: { nl: "Meten wat werkt", en: "Measuring what works" }, diy: { nl: "Cijfers staan verspreid over apps, als je er al aan toekomt.", en: "Numbers are spread across apps, if you get to them at all." }, us: { nl: "Bij social media krijg je elke maand een rapport met wat werkte en wat we gaan doen.", en: "For social media you get a monthly report with what worked and what we'll do next." } },
  { topic: { nl: "Controle", en: "Control" }, diy: { nl: "Je bepaalt alles zelf.", en: "You decide everything yourself." }, us: { nl: "Je keurt alles goed voordat het live gaat. Je accounts en bestanden blijven van jou.", en: "You approve everything before it goes live. Your accounts and files stay yours." } },
];

const diyFine: L[] = [
  { nl: "Je bent net begonnen en wilt eerst ontdekken wat je nodig hebt.", en: "You've just started and want to find out what you need first." },
  { nl: "Je vindt het maken zelf leuk en hebt er de tijd voor.", en: "You enjoy the making itself and have the time for it." },
  { nl: "Het gaat om iets kleins dat je zelden hoeft aan te passen.", en: "It's something small that rarely needs changing." },
];

const faq: Record<"nl" | "en", { question: string; answer: string }[]> = {
  nl: [
    { question: "Kan ik eerst zelf beginnen en later overstappen?", answer: "Ja. Veel klanten beginnen zelf en schakelen ons in als het te veel tijd kost of als ze willen groeien. We bouwen dan verder op wat er al staat, of beginnen opnieuw als dat beter is." },
    { question: "Moet ik alles uit handen geven?", answer: "Nee. Je kiest zelf wat je uitbesteedt. Sommige klanten laten alleen de techniek over, anderen ook de content of het beheer." },
    { question: "Blijven mijn accounts en bestanden van mij?", answer: "Ja. Je accounts, je website en de bestanden die we voor je maken zijn van jou. Stop je met ons, dan neem je alles mee." },
    { question: "Wat kost het?", answer: "Dat hangt af van wat je nodig hebt. Je krijgt altijd eerst een offerte met een vaste prijs. Bekijk de pakketten voor een indicatie of vraag een voorstel op maat aan." },
  ],
  en: [
    { question: "Can I start myself and switch later?", answer: "Yes. Many clients start on their own and bring us in when it takes too much time or when they want to grow. We build on what's there, or start fresh if that's better." },
    { question: "Do I have to hand over everything?", answer: "No. You choose what to outsource. Some clients only leave the technical side to us, others the content or management too." },
    { question: "Do my accounts and files stay mine?", answer: "Yes. Your accounts, your website and the files we make for you are yours. If you stop working with us, you take everything with you." },
    { question: "What does it cost?", answer: "That depends on what you need. You always get a quote with a fixed price first. Check the packages for an indication or ask for a tailored proposal." },
  ],
};

export async function generateMetadata() {
  const { locale } = await getI18n();
  return locale === "en"
    ? pageMetadata("/vergelijk", "DIY vs. Next Solutions", "An honest comparison: when doing it yourself is fine, and when outsourcing your website, Discord or social media saves you time and money.")
    : pageMetadata("/vergelijk", "Zelf doen vs. Next Solutions", "Een eerlijke vergelijking: wanneer zelf doen prima is, en wanneer uitbesteden van je website, Discord of social media je tijd en geld bespaart.");
}

export default async function ComparePage() {
  const { locale, lp } = await getI18n();
  const en = locale === "en";

  return (
    <>
      <FaqSchema items={faq[locale]} />
      <PageHeader
        eyebrow={en ? "Compare" : "Vergelijken"}
        title={en ? <>Do it yourself or <span className="text-gradient">leave it to us?</span></> : <>Zelf doen of <span className="text-gradient">uitbesteden?</span></>}
        description={en ? "An honest comparison. Sometimes doing it yourself is the best choice, and we'll say so." : "Een eerlijke vergelijking. Soms is zelf doen de beste keuze, en dan zeggen we dat ook."}
      />

      <section className="container max-w-5xl pb-20">
        <FadeUp>
          {/* Table on larger screens */}
          <div className="hidden overflow-hidden rounded-3xl border border-white/10 md:block">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">{en ? "Doing it yourself compared to Next Solutions" : "Zelf doen vergeleken met Next Solutions"}</caption>
              <thead>
                <tr className="bg-white/[0.03]">
                  <th scope="col" className="w-44 p-5 font-semibold text-zinc-400"></th>
                  <th scope="col" className="p-5 text-base font-semibold text-zinc-200">{en ? "Doing it yourself" : "Zelf doen"}</th>
                  <th scope="col" className="bg-brand-500/[0.07] p-5 text-base font-semibold text-white">Next Solutions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.topic.nl} className="border-t border-white/10">
                    <th scope="row" className="p-5 align-top font-semibold text-white">{r.topic[locale]}</th>
                    <td className="p-5 align-top text-zinc-400"><span className="flex gap-2"><Minus className="mt-0.5 size-4 shrink-0 text-zinc-600" />{r.diy[locale]}</span></td>
                    <td className="bg-brand-500/[0.07] p-5 align-top text-zinc-200"><span className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-brand-300" />{r.us[locale]}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards on phones */}
          <div className="space-y-4 md:hidden">
            {rows.map((r) => (
              <Card key={r.topic.nl} className="p-5">
                <h2 className="font-semibold text-white">{r.topic[locale]}</h2>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">{en ? "Doing it yourself" : "Zelf doen"}</p>
                <p className="mt-1 text-sm text-zinc-400">{r.diy[locale]}</p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-brand-300">Next Solutions</p>
                <p className="mt-1 text-sm text-zinc-200">{r.us[locale]}</p>
              </Card>
            ))}
          </div>
        </FadeUp>

        <FadeUp>
          <Card className="mt-12 p-6 sm:p-8">
            <h2 className="flex items-center gap-2 text-xl font-semibold"><ThumbsUp className="size-5 text-brand-300" /> {en ? "When doing it yourself is fine" : "Wanneer zelf doen prima is"}</h2>
            <ul className="mt-4 space-y-2">
              {diyFine.map((d) => <li key={d.nl} className="flex gap-2 text-zinc-300"><Check className="mt-0.5 size-4 shrink-0 text-brand-300" />{d[locale]}</li>)}
            </ul>
            <p className="mt-5 text-sm text-zinc-400">{en ? "Want to get started yourself? Our free checklists show what to pay attention to." : "Wil je zelf aan de slag? Onze gratis checklists laten zien waar je op moet letten."}</p>
            <Button asChild variant="secondary" className="mt-4"><Link href={lp("/gratis")}>{en ? "Free checklists" : "Gratis checklists"} <ArrowRight /></Link></Button>
          </Card>
        </FadeUp>
      </section>

      <section className="container max-w-3xl pb-24">
        <SectionHeading eyebrow="FAQ" title={en ? "Frequently asked questions" : "Veelgestelde vragen"} />
        <div className="mt-10"><FaqAccordion items={faq[locale]} /></div>
      </section>
      <CallToAction />
    </>
  );
}
