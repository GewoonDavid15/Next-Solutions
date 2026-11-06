export const site = {
  name: "Next Solutions",
  description:
    "Next Solutions is een digital agency voor Media, Software en Game Development. Discord bots, websites, FiveM scripts, Minecraft servers en branding.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.NODE_ENV === "production" ? "https://nextsolutionshq.nl" : "http://localhost:3000"),
  discordInvite: process.env.NEXT_PUBLIC_DISCORD_INVITE ?? "https://discord.gg/",
  email: "info@nextsolutionshq.nl",
  /** Social accounts in the footer. Leave a link empty ("") to hide it. */
  socials: {
    x: "",
    instagram: "",
    youtube: "",
    github: "",
  },
};

/**
 * The portfolio (lib/data.ts → projects) still holds example cases. It stays hidden until there are real
 * projects: set this to true to bring back the menu item, the pages and the sitemap entries.
 */
export const SHOW_PORTFOLIO = false;

const allNavLinks = [
  { href: "/", label: "Home" },
  { href: "/diensten", label: "Diensten" },
  { href: "/prijzen", label: "Pakketten" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/over-ons", label: "Over ons" },
  { href: "/nieuws", label: "Nieuws" },
  { href: "/community", label: "Community" },
  { href: "/klantportaal", label: "Klantportaal" },
  { href: "/contact", label: "Contact" },
] as const;

export const navLinks = allNavLinks.filter((l) => SHOW_PORTFOLIO || l.href !== "/portfolio");

/** Shown directly in the top bar on large screens. */
export const primaryNav = ["/", "/diensten", "/prijzen", "/community", "/contact"] as const;

/** Grouped under "Meer" in the top bar, and as sections in the mobile menu. */
export const moreNav = [
  { href: "/over-ons", icon: "info" },
  { href: "/nexify", icon: "sparkles" },
  { href: "/team", icon: "users" },
  { href: "/reviews", icon: "star" },
  { href: "/nieuws", icon: "newspaper" },
  { href: "/vacatures", icon: "briefcase" },
  { href: "/status", icon: "activity" },
  ...(SHOW_PORTFOLIO ? [{ href: "/portfolio", icon: "folder" } as const] : []),
] as const;
