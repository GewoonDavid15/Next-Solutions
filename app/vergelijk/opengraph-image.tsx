import { ogSize, pageOg } from "@/lib/og";

export const alt = "Zelf doen of uitbesteden? Next Solutions";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return pageOg("Zelf doen of uitbesteden?", "Eerlijke vergelijking", "Wanneer zelf doen prima is, en wanneer uitbesteden je tijd en geld bespaart.");
}
