import type { MetadataRoute } from "next";
import { projects } from "@/lib/data";
import { navLinks, site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages: MetadataRoute.Sitemap = navLinks
    .filter((l) => l.href !== "/klantportaal")
    .map((l) => ({
      url: `${site.url}${l.href === "/" ? "" : l.href}`,
      lastModified: now,
      changeFrequency: l.href === "/" ? "weekly" : "monthly",
      priority: l.href === "/" ? 1 : 0.8,
    }));

  const cases: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${site.url}/portfolio/${p.slug}`,
    lastModified: now,
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  const live: MetadataRoute.Sitemap = ["/team", "/reviews", "/vacatures", "/status"].map((href) => ({
    url: `${site.url}${href}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.5,
  }));

  const legal: MetadataRoute.Sitemap = ["/privacy", "/voorwaarden"].map((href) => ({
    url: `${site.url}${href}`,
    lastModified: now,
    changeFrequency: "yearly",
    priority: 0.3,
  }));

  return [...pages, ...live, ...cases, ...legal];
}
