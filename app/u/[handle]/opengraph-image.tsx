import { getPublicProfile } from "@/lib/bot-api";
import { ogSize, pageOg } from "@/lib/og";

export const alt = "Profiel bij Next Solutions";
export const size = ogSize;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const p = await getPublicProfile(handle.toLowerCase());
  return pageOg(p?.discord.naam ?? "Profiel", p ? `@${p.handle} • level ${p.niveau.level}` : "Next Solutions", p?.tagline || p?.bio || undefined);
}
