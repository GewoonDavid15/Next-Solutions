import { getPost, getPosts } from "@/lib/blog";
import { ogSize, pageOg } from "@/lib/og";

export const alt = "Artikel van Next Solutions";
export const size = ogSize;
export const contentType = "image/png";

export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug).catch(() => null);
  return pageOg(post?.title ?? "Nieuws", post?.category ?? "Nieuws", post?.description);
}
