import { NextResponse } from "next/server";
import { getPosts } from "@/lib/blog";
import { checklists } from "@/lib/checklists";
import { getContent } from "@/lib/data";
import { servicePages } from "@/lib/dienst-paginas";
import { getMessages } from "@/lib/i18n/server";
import { articles } from "@/lib/kennisbank";
import { SHOW_PORTFOLIO } from "@/lib/site";

/** Everything the site search (Ctrl+K) can find, per language. Small enough to load in one go. */
export async function GET(request: Request) {
  const locale = new URL(request.url).searchParams.get("taal") === "en" ? "en" : "nl";
  const en = locale === "en";
  const lp = (href: string) => (en ? (href === "/" ? "/en" : `/en${href}`) : href);
  const t = getMessages(locale);
  const content = getContent(locale);
  const items: { s: string; t: string; d: string; h: string }[] = [];

  const extraPages: Record<string, string> = en
    ? { "/samenstellen": "Package builder", "/privacy": "Privacy policy", "/voorwaarden": "Terms and conditions" }
    : { "/samenstellen": "Pakket samenstellen", "/privacy": "Privacyverklaring", "/voorwaarden": "Algemene voorwaarden" };
  for (const [href, label] of Object.entries({ ...t.nav.links, ...extraPages })) {
    if (href === "/portfolio" && !SHOW_PORTFOLIO) continue;
    items.push({ s: en ? "Page" : "Pagina", t: label, d: "", h: lp(href) });
  }
  servicePages.forEach((p, i) => {
    const s = content.services[i];
    if (s) items.push({ s: en ? "Service" : "Dienst", t: s.title, d: p.intro[locale], h: lp(`/diensten/${p.slug}`) });
  });
  for (const c of checklists) items.push({ s: en ? "Free checklist" : "Gratis checklist", t: c.title[locale], d: c.intro[locale], h: lp(`/gratis/${c.slug}`) });
  for (const a of articles) items.push({ s: en ? "Knowledge base" : "Kennisbank", t: a.titel[locale], d: a.samenvatting[locale], h: lp(`/kennisbank/${a.slug}`) });
  for (const p of await getPosts()) items.push({ s: en ? "News" : "Nieuws", t: p.title, d: p.description, h: lp(`/nieuws/${p.slug}`) });
  for (const f of content.faq) items.push({ s: "FAQ", t: f.question, d: f.answer, h: lp("/diensten") });

  return NextResponse.json(items, { headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" } });
}
