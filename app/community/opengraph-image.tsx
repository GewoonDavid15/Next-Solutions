import { ogSize, pageOg } from "@/lib/og";

export const alt = "De community van Next Solutions";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return pageOg("Join onze community", "Discord", "Stel vragen, deel je projecten, doe mee aan giveaways en volg ons werk live.");
}
