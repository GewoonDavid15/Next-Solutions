import type { MetadataRoute } from "next";
import { getPosts } from "@/lib/blog";
import { getPublicProfileHandles } from "@/lib/bot-api";
import { articles } from "@/lib/kennisbank";
import { servicePages } from "@/lib/dienst-paginas";
import { projects } from "@/lib/data";
import { localePath } from "@/lib/i18n/config";
import { navLinks, SHOW_PORTFOLIO, site } from "@/lib/site";

type Entry = { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number };

/**
 * Every page exists in Dutch (plain URL) and English (/en/...); both are listed with hreflang alternates.
 * News articles are written in Dutch only, so they are listed once.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: Entry[] = [
    ...navLinks
      .filter((l) => l.href !== "/klantportaal")
      .map((l) => ({ path: l.href, changeFrequency: l.href === "/" ? ("weekly" as const) : ("monthly" as const), priority: l.href === "/" ? 1 : 0.8 })),
    ...["/social-media", "/nexify", "/kennisbank", "/team", "/reviews", "/vacatures", "/status"].map((path) => ({ path, changeFrequency: "daily" as const, priority: 0.5 })),
    ...(SHOW_PORTFOLIO ? projects : []).map((p) => ({ path: `/portfolio/${p.slug}`, changeFrequency: "yearly" as const, priority: 0.6 })),
    ...servicePages.map((s) => ({ path: `/diensten/${s.slug}`, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...articles.map((a) => ({ path: `/kennisbank/${a.slug}`, changeFrequency: "monthly" as const, priority: 0.5 })),
    ...["/privacy", "/voorwaarden"].map((path) => ({ path, changeFrequency: "yearly" as const, priority: 0.3 })),
  ];

  const url = (path: string) => `${site.url}${path === "/" ? "" : path}`;
  const pages = entries.flatMap(({ path, changeFrequency, priority }) => {
    const languages = { "nl-NL": url(path), en: url(localePath("en", path)) };
    return [
      { url: languages["nl-NL"], lastModified: now, changeFrequency, priority, alternates: { languages } },
      { url: languages.en, lastModified: now, changeFrequency, priority: Math.max(0.1, priority - 0.1), alternates: { languages } },
    ];
  });

  const posts: MetadataRoute.Sitemap = (await getPosts()).map((post) => ({
    url: `${site.url}/nieuws/${post.slug}`,
    lastModified: post.date ? new Date(post.date) : now,
    changeFrequency: "yearly",
    priority: 0.5,
  }));

  const profiles: MetadataRoute.Sitemap = (await getPublicProfileHandles()).map((p) => ({
    url: `${site.url}/u/${p.handle}`,
    lastModified: p.bijgewerkt ? new Date(p.bijgewerkt) : now,
    changeFrequency: "weekly",
    priority: 0.3,
  }));

  return [...pages, ...posts, ...profiles];
}
