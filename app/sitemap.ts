import type { MetadataRoute } from "next";
import { projects } from "@/lib/data";
import { localePath } from "@/lib/i18n/config";
import { navLinks, site } from "@/lib/site";

type Entry = { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number };

/** Every page exists in Dutch (plain URL) and English (/en/...); both are listed with hreflang alternates. */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: Entry[] = [
    ...navLinks
      .filter((l) => l.href !== "/klantportaal")
      .map((l) => ({ path: l.href, changeFrequency: l.href === "/" ? ("weekly" as const) : ("monthly" as const), priority: l.href === "/" ? 1 : 0.8 })),
    ...["/team", "/reviews", "/vacatures", "/status"].map((path) => ({ path, changeFrequency: "daily" as const, priority: 0.5 })),
    ...projects.map((p) => ({ path: `/portfolio/${p.slug}`, changeFrequency: "yearly" as const, priority: 0.6 })),
    ...["/privacy", "/voorwaarden"].map((path) => ({ path, changeFrequency: "yearly" as const, priority: 0.3 })),
  ];

  const url = (path: string) => `${site.url}${path === "/" ? "" : path}`;
  return entries.flatMap(({ path, changeFrequency, priority }) => {
    const languages = { "nl-NL": url(path), en: url(localePath("en", path)) };
    return [
      { url: languages["nl-NL"], lastModified: now, changeFrequency, priority, alternates: { languages } },
      { url: languages.en, lastModified: now, changeFrequency, priority: Math.max(0.1, priority - 0.1), alternates: { languages } },
    ];
  });
}
