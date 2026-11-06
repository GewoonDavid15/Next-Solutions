import { ogSize, pageOg } from "@/lib/og";

export const alt = "Social media beheer door Next Solutions";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return pageOg("Jouw socials, geregeld.", "Social media", "Strategie, content en beheer op Instagram, TikTok, YouTube, LinkedIn, X en Facebook.");
}
