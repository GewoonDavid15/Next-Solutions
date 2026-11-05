"use client";

import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import type { Content, ProjectCategory } from "@/lib/data";
import { cn } from "@/lib/utils";
import { ProjectMockup } from "./ProjectMockup";

type Filter = "all" | ProjectCategory;

export function PortfolioGrid({ projects, filters }: { projects: Content["projects"]; filters: Content["projectFilters"] }) {
  const { locale, lp } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // The active filter lives in the URL, so a filtered view can be shared and
  // survives the back button.
  const requested = searchParams.get("filter");
  const filter: Filter = filters.some((f) => f.id === requested) ? (requested as Filter) : "all";

  const setFilter = useCallback(
    (next: Filter) => {
      const query = next === "all" ? "" : `?filter=${next}`;
      router.replace(`${pathname}${query}`, { scroll: false });
    },
    [router, pathname],
  );

  const visible = projects.filter((p) => filter === "all" || p.category === filter);

  return (
    <LayoutGroup>
      <div role="tablist" aria-label={locale === "en" ? "Filter projects" : "Filter projecten"} className="mx-auto mb-12 flex w-fit flex-wrap justify-center gap-1 rounded-2xl glass p-1.5">
        {filters.map((f) => {
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(f.id)}
              className={cn(
                "relative rounded-xl px-5 py-2.5 font-display text-sm font-medium transition-colors",
                active ? "text-white" : "text-zinc-400 hover:text-white",
              )}
            >
              {active && (
                <motion.span
                  layoutId="filter-pill"
                  className="absolute inset-0 -z-10 rounded-xl bg-brand-gradient shadow-glow"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Masonry: CSS columns keep varying heights tightly packed. */}
      <motion.div layout className="columns-1 gap-6 sm:columns-2 lg:columns-3">
        <AnimatePresence mode="popLayout">
          {visible.map((project) => (
            <motion.article
              key={project.id}
              layout
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="group mb-6 break-inside-avoid overflow-hidden rounded-3xl glass transition-shadow duration-300 hover:border-brand-500/40 hover:shadow-glow-lg"
            >
              <Link href={lp(`/portfolio/${project.slug}`)} className="block">
                <ProjectMockup project={project} />
                <div className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold">{project.title}</h2>
                    <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs capitalize text-zinc-400">{project.category}</span>
                  </div>
                  <p className="mt-1 text-sm text-zinc-500">{project.client}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {project.tags.map((t) => (
                      <span key={t} className="rounded-lg border border-brand-500/20 bg-brand-600/10 px-2 py-0.5 text-xs text-brand-200">
                        {t}
                      </span>
                    ))}
                  </div>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-300">
                    {locale === "en" ? "View case" : "Bekijk case"}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </motion.article>
          ))}
        </AnimatePresence>
      </motion.div>
    </LayoutGroup>
  );
}
