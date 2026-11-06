import { articles, getArticle } from "@/lib/kennisbank";
import { ogSize, pageOg } from "@/lib/og";

export const alt = "Kennisbank van Next Solutions";
export const size = ogSize;
export const contentType = "image/png";

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = getArticle(slug);
  return pageOg(a?.titel.nl ?? "Kennisbank", "Kennisbank", a?.samenvatting.nl);
}
