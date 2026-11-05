import { ArrowRight, Calendar, Clock } from "lucide-react";
import Link from "next/link";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { CallToAction } from "@/components/sections/CallToAction";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatDate, getPosts } from "@/lib/blog";
import { getI18n, pageMetadata } from "@/lib/i18n/server";

export async function generateMetadata() {
  const { locale } = await getI18n();
  return locale === "en"
    ? pageMetadata("/nieuws", "News", "Articles about Discord bots, FiveM, Minecraft and design, written by the Next Solutions team.")
    : pageMetadata("/nieuws", "Nieuws", "Artikelen over Discord bots, FiveM, Minecraft en design, geschreven door het team van Next Solutions.");
}

export default async function NieuwsPage() {
  const posts = await getPosts();
  const { locale, lp } = await getI18n();
  const en = locale === "en";

  return (
    <>
      <PageHeader
        eyebrow={en ? "News" : "Nieuws"}
        title={en ? <>What we <span className="text-gradient">learn</span> and share</> : <>Wat we <span className="text-gradient">leren</span> en delen</>}
        description={
          en
            ? "Practical pieces about bots, servers and design. No marketing talk, just what we run into in practice. Our articles are written in Dutch."
            : "Praktische stukken over bots, servers en design. Geen marketingpraat, wel wat we in de praktijk tegenkomen."
        }
      />

      <section className="pb-12">
        <div className="container">
          {posts.length === 0 ? (
            <p className="glass rounded-3xl p-10 text-center text-zinc-400">
              {en ? "No articles online yet. Check back soon." : "Er staan nog geen artikelen online. Kom binnenkort terug."}
            </p>
          ) : (
            <Stagger className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <StaggerItem key={post.slug} className="h-full">
                  <Link href={lp(`/nieuws/${post.slug}`)} className="block h-full rounded-3xl">
                    <Card interactive className="group flex h-full flex-col">
                      <Badge className="w-fit">{post.category}</Badge>
                      <h2 className="mt-4 text-xl font-semibold leading-snug">{post.title}</h2>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-400">{post.description}</p>
                      <div className="mt-6 flex items-center gap-4 text-xs text-zinc-500">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="size-3.5" /> {formatDate(post.date, locale)}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="size-3.5" /> {post.readingTime} min
                        </span>
                      </div>
                      <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-300">
                        {en ? "Read more" : "Lees verder"}
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </Card>
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </div>
      </section>

      <CallToAction />
    </>
  );
}
