import "server-only";
import { checklists } from "@/lib/checklists";
import { getContent } from "@/lib/data";
import { servicePages } from "@/lib/dienst-paginas";
import { articles } from "@/lib/kennisbank";

/**
 * Help assistant without AI: finds the best matching passage in the knowledge base, FAQ and
 * service pages. Answers only with our own texts, so it never makes things up.
 */
type Lang = "nl" | "en";
interface Passage { text: string; title: string; href: string; tokens: string[] }

const STOP = new Set(("de het een en of in op aan van voor met is zijn wat hoe kan ik je jij mijn wij we ons onze er dat die dit deze niet ook als bij naar om te tot wordt worden heb hebben moet moeten wil wilt kun kunnen zo dan maar nog al wel werkt werken welke welk jullie jij u hoeveel waar wanneer waarom gebruiken gebruik graag mag mogen nodig krijg krijgen iets alles " +
  "the a an and or in on at of for with is are what how can i you my we our there that this these not also as by to be do does have has will would should could your which where when why use using work works need get").split(" "));

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
// Very light stemming so "betalen", "betaling" and "betaald" find each other
const stem = (w: string) => w.replace(/(ingen|ing|en|es|s|t|d)$/, "").slice(0, 7);
const tokenize = (s: string) => norm(s).split(/[^a-z0-9]+/).filter((w) => w.length > 1 && !STOP.has(w)).map(stem);

const cache: Partial<Record<Lang, Passage[]>> = {};
function corpus(locale: Lang): Passage[] {
  if (cache[locale]) return cache[locale]!;
  const lp = (href: string) => (locale === "en" ? `/en${href}` : href);
  const content = getContent(locale);
  const list: Omit<Passage, "tokens">[] = [];
  for (const f of content.faq) list.push({ title: f.question, text: f.answer, href: lp("/diensten") });
  for (const a of articles) {
    list.push({ title: a.titel[locale], text: a.samenvatting[locale], href: lp(`/kennisbank/${a.slug}`) });
    for (const part of a.inhoud[locale].split(/\n\s*\n/)) {
      const clean = part.replace(/^#+\s*/gm, "").replace(/^[-\d.]+\s+/gm, "").trim();
      if (clean.length > 40) list.push({ title: a.titel[locale], text: clean, href: lp(`/kennisbank/${a.slug}`) });
    }
  }
  servicePages.forEach((p, i) => {
    const s = content.services[i];
    if (!s) return;
    list.push({ title: s.title, text: p.intro[locale], href: lp(`/diensten/${p.slug}`) });
    for (const f of p.faq[locale]) list.push({ title: f.question, text: f.answer, href: lp(`/diensten/${p.slug}`) });
  });
  for (const c of checklists) list.push({ title: c.title[locale], text: c.intro[locale], href: lp(`/gratis/${c.slug}`) });
  cache[locale] = list.map((p) => ({ ...p, tokens: tokenize(`${p.title} ${p.title} ${p.text}`) }));
  return cache[locale]!;
}

export function answer(question: string, locale: Lang) {
  const q = [...new Set(tokenize(question))];
  const passages = corpus(locale);
  if (!q.length) return { zeker: false, antwoord: null, bronnen: [] as { titel: string; href: string }[] };
  // How rare is a word? Rare words (like "factuur") count more than common ones (like "project")
  const df = new Map(q.map((w) => [w, passages.filter((p) => p.tokens.includes(w)).length]));
  // A word that appears nowhere in our texts (like "pizza" or "hosting") weighs heavily: then we are not sure
  const idf = (w: string) => Math.log(1 + passages.length / (1 + (df.get(w) ?? 0)));
  const totalWeight = q.reduce((sum, w) => sum + idf(w), 0);
  const scored = passages.map((p) => {
    let score = 0, matched = 0;
    for (const w of q) {
      const n = p.tokens.filter((t) => t === w).length;
      if (n) { matched += idf(w); score += (1 + Math.log(n)) * idf(w); }
    }
    const coverage = totalWeight ? matched / totalWeight : 0;
    return { p, score: score * coverage, coverage };
  }).filter((x) => x.score > 0).sort((a, b) => b.score - a.score);
  const best = scored[0];
  // Only "sure" when most words of the question match; otherwise we suggest pages and the team
  const zeker = Boolean(best && best.score > 1.2 && best.coverage >= 0.6);
  const bronnen = [...new Map(scored.slice(0, 6).map((x) => [x.p.href, { titel: x.p.title, href: x.p.href }])).values()].slice(0, 3);
  return { zeker, antwoord: best ? { titel: best.p.title, tekst: best.p.text.slice(0, 600), href: best.p.href } : null, bronnen };
}
