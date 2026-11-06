import { checklistBySlug } from "@/lib/checklists";
import { ogSize, pageOg } from "@/lib/og";

export const alt = "Gratis checklist van Next Solutions";
export const size = ogSize;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const c = checklistBySlug((await params).slug);
  return pageOg(c?.title.nl ?? "Gratis checklist", "Gratis checklist", c?.intro.nl ?? "");
}
