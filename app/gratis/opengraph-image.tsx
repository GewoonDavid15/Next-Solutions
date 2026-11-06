import { ogSize, pageOg } from "@/lib/og";

export const alt = "Gratis checklists van Next Solutions";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return pageOg("Gratis checklists", "Next Solutions", "Voor je Instagram en TikTok, je Discord-server en je website. Direct te gebruiken.");
}
