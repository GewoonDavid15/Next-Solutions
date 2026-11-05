import type { Metadata } from "next";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FadeUp } from "@/components/motion/FadeUp";
import { CallToAction } from "@/components/sections/CallToAction";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatDate, getPost, getPosts } from "@/lib/blog";
import { getI18n, pageMetadata } from "@/lib/i18n/server";

interface Props {
  params: Promise<{ slug: string }>;
}

// Rendered per request (not prerendered), so /en/nieuws/... gets English labels. Unknown slugs give a 404 below.

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return pageMetadata(`/nieuws/${slug}`, post.title, post.description, {
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
    },
  });
}

export default async function ArtikelPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const { locale, lp } = await getI18n();
  const en = locale === "en";
  const others = (await getPosts()).filter((p) => p.slug !== slug).slice(0, 2);

  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { "@type": "Organization", name: post.author },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <article>
        <section className="relative overflow-hidden pb-8 pt-32 sm:pt-40">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-10 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-brand-600/20 blur-[120px]"
          />
          <div className="container relative max-w-3xl">
            <FadeUp>
              <Link
                href={lp("/nieuws")}
                className="inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
              >
                <ArrowLeft className="size-4" /> {en ? "All articles" : "Alle artikelen"}
              </Link>
              <Badge className="mt-6">{post.category}</Badge>
              <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">{post.title}</h1>
              <p className="mt-4 text-lg leading-relaxed text-zinc-400">{post.description}</p>
              <div className="mt-6 flex flex-wrap items-center gap-5 text-sm text-zinc-500">
                <span className="inline-flex items-center gap-2">
                  <User className="size-4" /> {post.author}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Calendar className="size-4" /> {formatDate(post.date, locale)}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Clock className="size-4" /> {post.readingTime} {en ? "min read" : "min lezen"}
                </span>
              </div>
            </FadeUp>
          </div>
        </section>

        <section className="pb-12">
          <div className="container max-w-3xl">
            <FadeUp>
              {en && (
                <p lang="en" className="mb-8 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-zinc-400">
                  This article is written in Dutch.
                </p>
              )}
              <div lang="nl" className="prose-ns" dangerouslySetInnerHTML={{ __html: post.html }} />
            </FadeUp>
          </div>
        </section>
      </article>

      {others.length > 0 && (
        <section className="pb-8">
          <div className="container max-w-3xl">
            <h2 className="mb-5 font-display text-sm uppercase tracking-wider text-zinc-500">{en ? "Read next" : "Lees ook"}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {others.map((other) => (
                <Link key={other.slug} href={lp(`/nieuws/${other.slug}`)} className="block rounded-3xl">
                  <Card interactive className="h-full p-5">
                    <Badge className="w-fit">{other.category}</Badge>
                    <p className="mt-3 font-display text-base text-white">{other.title}</p>
                    <p className="mt-1 text-xs text-zinc-500">{formatDate(other.date, locale)}</p>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <CallToAction />
    </>
  );
}
