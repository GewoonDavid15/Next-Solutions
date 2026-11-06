import { ogSize, pageOg } from "@/lib/og";

export const alt = "Nexify, oprichter van Next Solutions";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return pageOg("Nexify", "De maker", "Oprichter van Next Solutions: software, games en social media voor communities.");
}
