import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, Calendar, Clock, Tag } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FadeUp } from "@/components/motion/FadeUp";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { CallToAction } from "@/components/sections/CallToAction";
import { ProjectMockup } from "@/components/sections/ProjectMockup";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { projects } from "@/lib/data";
import { cn } from "@/lib/utils";

interface Props {
  params: Promise<{ slug: string }>;
}

/** The project list is static, so any other slug is a genuine 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return {};
  return {
    title: `${project.title} — ${project.client}`,
    description: project.summary,
    openGraph: { title: project.title, description: project.summary, type: "article" },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  const index = projects.findIndex((p) => p.slug === slug);
  const next = projects[(index + 1) % projects.length];

  const meta = [
    { icon: Tag, label: "Categorie", value: project.category, capitalize: true },
    { icon: Calendar, label: "Jaar", value: String(project.year), capitalize: false },
    { icon: Clock, label: "Doorlooptijd", value: project.duration, capitalize: false },
  ];

  return (
    <>
      <section className="relative overflow-hidden pb-10 pt-32 sm:pt-40">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-10 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-brand-600/20 blur-[120px]"
        />
        <div className="container relative">
          <FadeUp>
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
            >
              <ArrowLeft className="size-4" /> Terug naar portfolio
            </Link>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              <Badge className="capitalize">{project.category}</Badge>
              <span className="text-sm text-zinc-500">{project.client}</span>
            </div>

            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">{project.title}</h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">{project.summary}</p>
          </FadeUp>

          <FadeUp delay={0.1} className="mt-12 overflow-hidden rounded-3xl glass">
            <ProjectMockup project={project} />
          </FadeUp>

          <Stagger className="mt-6 grid gap-4 sm:grid-cols-3">
            {meta.map(({ icon: Icon, label, value, capitalize }) => (
              <StaggerItem key={label} className="glass flex items-center gap-3 rounded-2xl p-4">
                <Icon className="size-5 shrink-0 text-brand-400" />
                <div>
                  <p className="text-xs uppercase tracking-wider text-zinc-500">{label}</p>
                  <p className={cn("font-display text-white", capitalize && "capitalize")}>{value}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="container grid gap-8 lg:grid-cols-3">
          <FadeUp className="lg:col-span-2">
            <div className="space-y-8">
              <Card>
                <h2 className="text-2xl font-semibold">De uitdaging</h2>
                <p className="mt-3 leading-relaxed text-zinc-400">{project.challenge}</p>
              </Card>
              <Card>
                <h2 className="text-2xl font-semibold">Onze aanpak</h2>
                <p className="mt-3 leading-relaxed text-zinc-400">{project.solution}</p>
              </Card>
            </div>
          </FadeUp>

          <FadeUp delay={0.1} className="space-y-6">
            <Card>
              <h2 className="text-lg font-semibold">Resultaat</h2>
              <dl className="mt-4 space-y-4">
                {project.results.map((r) => (
                  <div key={r.label}>
                    <dd className="font-display text-3xl font-semibold text-gradient">{r.value}</dd>
                    <dt className="text-sm text-zinc-400">{r.label}</dt>
                  </div>
                ))}
              </dl>
            </Card>
            <Card>
              <h2 className="text-lg font-semibold">Stack</h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {project.stack.map((t) => (
                  <li
                    key={t}
                    className="rounded-xl border border-brand-500/20 bg-brand-600/10 px-3 py-1.5 text-sm text-brand-200"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </Card>
          </FadeUp>
        </div>
      </section>

      <section className="pb-4">
        <div className="container">
          <FadeUp>
            <Link href={`/portfolio/${next.slug}`} className="group block">
              <Card interactive className="flex items-center justify-between gap-6">
                <div>
                  <p className="text-sm text-zinc-500">Volgend project</p>
                  <p className="mt-1 font-display text-2xl font-semibold text-white">{next.title}</p>
                  <p className="text-sm text-zinc-400">{next.client}</p>
                </div>
                <ArrowRight className="size-6 shrink-0 text-brand-400 transition-transform group-hover:translate-x-1" />
              </Card>
            </Link>
          </FadeUp>
        </div>
      </section>

      <CallToAction
        title={<>Zoiets voor jouw project?</>}
        description="Vertel ons waar je tegenaan loopt. We denken vrijblijvend met je mee."
      />
    </>
  );
}
