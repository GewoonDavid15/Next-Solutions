import type { MetadataRoute } from "next";
import { navLinks, site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return navLinks
    .filter((l) => l.href !== "/klantportaal")
    .map((l) => ({
      url: `${site.url}${l.href === "/" ? "" : l.href}`,
      lastModified: now,
      changeFrequency: l.href === "/" ? "weekly" : "monthly",
      priority: l.href === "/" ? 1 : 0.8,
    }));
}
