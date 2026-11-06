import { ogSize, pageOg } from "@/lib/og";

export const alt = "Pakketten van Next Solutions";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return pageOg("Pakketten", "Next Solutions", "Software, Game Development en Media & Social. Prijzen op aanvraag, altijd op maat.");
}
