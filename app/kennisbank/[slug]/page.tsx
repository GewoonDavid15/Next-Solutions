import { ArrowLeft, MessageSquare } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { getI18n, pageMetadata } from "@/lib/i18n/server";
import { articles, CATEGORIES, getArticle } from "@/lib/kennisbank";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const [{ slug }, { locale }] = await Promise.all([params, getI18n()]);
  const a = getArticle(slug);
  if (!a) return {};
  return pageMetadata(`/kennisbank/${a.slug}`, a.titel[locale], a.samenvatting[locale]);
}

function Body({ text }: { text: string }) {
  const blocks: React.ReactNode[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  const flush = () => {
    if (!list) return;
    const Tag = list.ordered ? "ol" : "ul";
    blocks.push(<Tag key={blocks.length} className={list.ordered ? "list-decimal space-y-2 pl-6" : "list-disc space-y-2 pl-6"}>{list.items.map((i, n) => <li key={n}>{i}</li>)}</Tag>);
    list = null;
  };
  for (const line of text.split("\n")) {
    const num = line.match(/^\d+\.\s+(.*)/);
    if (line.startsWith("- ") || num) {
      const ordered = Boolean(num);
      if (!list || list.ordered !== ordered) { flush(); list = { ordered, items: [] }; }
      list.items.push(num ? num[1] : line.slice(2));
      continue;
    }
    flush();
    if (line.startsWith("## ")) blocks.push(<h2 key={blocks.length} className="pt-4 text-2xl font-semibold text-white">{line.slice(3)}</h2>);
    else if (line.trim()) blocks.push(<p key={blocks.length}>{line}</p>);
  }
  flush();
  return <div className="space-y-4 text-lg leading-relaxed text-zinc-300">{blocks}</div>;
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const [{ slug }, { locale, lp }] = await Promise.all([params, getI18n()]);
  const a = getArticle(slug);
  if (!a) notFound();
  const en = locale === "en";
  const related = articles.filter((x) => x.categorie === a.categorie && x.slug !== a.slug).slice(0, 3);
  return (
    <article className="pb-20 pt-32 sm:pt-40">
      <div className="container max-w-3xl">
        <Link href={lp("/kennisbank")} className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white"><ArrowLeft className="size-4" /> {en ? "Knowledge base" : "Kennisbank"}</Link>
        <p className="mt-8 text-sm uppercase tracking-wide text-brand-300">{a.icon} {CATEGORIES[a.categorie][locale]}</p>
        <h1 className="mt-2 text-4xl font-semibold sm:text-5xl">{a.titel[locale]}</h1>
        <p className="mt-4 text-xl text-zinc-400">{a.samenvatting[locale]}</p>
        <div className="mt-10"><Body text={a.inhoud[locale]} /></div>

        <div className="glass mt-12 flex flex-col items-start gap-4 rounded-3xl p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-zinc-300">{en ? "Still have a question?" : "Nog een vraag?"}</p>
          <Button asChild variant="discord" size="sm"><a href={site.discordInvite} target="_blank" rel="noopener noreferrer"><MessageSquare /> {en ? "Ask us on Discord" : "Vraag het ons op Discord"}</a></Button>
        </div>

        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="text-lg font-semibold">{en ? "Related" : "Ook handig"}</h2>
            <ul className="mt-3 space-y-2">
              {related.map((r) => <li key={r.slug}><Link href={lp(`/kennisbank/${r.slug}`)} className="text-brand-300 hover:text-white">{r.icon} {r.titel[locale]}</Link></li>)}
            </ul>
          </div>
        )}
      </div>
    </article>
  );
}
