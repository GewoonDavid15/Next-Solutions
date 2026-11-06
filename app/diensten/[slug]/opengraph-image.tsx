import { services } from "@/lib/data";
import { servicePageBySlug, servicePages } from "@/lib/dienst-paginas";
import { ogSize, pageOg } from "@/lib/og";

export const alt = "Dienst van Next Solutions";
export const size = ogSize;
export const contentType = "image/png";

export function generateStaticParams() {
  return servicePages.map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const found = servicePageBySlug(slug);
  const service = found ? services[found.index] : null;
  return pageOg(service?.title ?? "Diensten", "Dienst", found?.page.intro.nl);
}
