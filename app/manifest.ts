import type { MetadataRoute } from "next";

/** Lets visitors install the site (and the client portal) as an app on their phone or computer. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/klantportaal",
    name: "Next Solutions",
    short_name: "Next Solutions",
    description: "Je klantportaal van Next Solutions: projecten, tickets, offertes en meldingen.",
    start_url: "/klantportaal?bron=app",
    scope: "/",
    display: "standalone",
    background_color: "#0A0C10",
    theme_color: "#0A0C10",
    lang: "nl",
    categories: ["business", "productivity"],
    icons: [
      { src: "/pwa-icon/192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/pwa-icon/512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/pwa-icon/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Meldingen", url: "/klantportaal#meldingen" },
      { name: "Tickets", url: "/klantportaal#tickets" },
      { name: "Projecten", url: "/klantportaal#projecten" },
    ],
  };
}
