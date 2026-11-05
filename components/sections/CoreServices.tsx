import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getI18n } from "@/lib/i18n/server";
import { cn } from "@/lib/utils";

export async function CoreServices() {
  const { locale, content, lp } = await getI18n();
  const en = locale === "en";
  return (
    <section id="diensten" className="section scroll-mt-20">
      <div className="container">
        <SectionHeading
          eyebrow={en ? "Core services" : "Kerndiensten"}
          title={en ? <>Three disciplines, <span className="text-gradient">one team</span></> : <>Drie disciplines, <span className="text-gradient">één team</span></>}
          description={
            en
              ? "Everything under one roof, so your project fits together — from code to pixel."
              : "Alles onder één dak, zodat jouw project klopt — van code tot pixel."
          }
        />
        <Stagger className="grid gap-6 md:grid-cols-3">
          {content.departments.map(({ id, title, tagline, description, icon: Icon, gradient }) => (
            <StaggerItem key={id}>
              <Link href={lp("/diensten")} className="block h-full rounded-3xl">
                <Card interactive className="group h-full">
                  <div
                    aria-hidden
                    className={cn("absolute -right-16 -top-16 size-48 rounded-full bg-gradient-to-br opacity-20 blur-3xl transition-opacity duration-500 group-hover:opacity-50", gradient)}
                  />
                  <div className={cn("mb-6 grid size-14 place-items-center rounded-2xl bg-gradient-to-br shadow-glow", gradient)}>
                    <Icon className="size-7 text-ink" />
                  </div>
                  <p className="text-sm font-medium text-brand-300">{tagline}</p>
                  <h3 className="mt-1 text-2xl font-semibold">{title}</h3>
                  <p className="mt-3 leading-relaxed text-zinc-400">{description}</p>
                  <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-white">
                    {en ? "Learn more" : "Meer info"}
                    <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </Card>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
