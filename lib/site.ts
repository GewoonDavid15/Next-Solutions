export const site = {
  name: "Next Solutions",
  description:
    "Next Solutions is een digital agency voor Media, Software en Game Development. Discord bots, websites, FiveM scripts, Minecraft servers en branding.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  discordInvite: process.env.NEXT_PUBLIC_DISCORD_INVITE ?? "https://discord.gg/",
  email: "hello@nextsolutions.nl",
};

/**
 * The portfolio (lib/data.ts → projects) still holds example cases. It stays hidden until there are real
 * projects: set this to true to bring back the menu item, the pages and the sitemap entries.
 */
export const SHOW_PORTFOLIO = false;

const allNavLinks = [
  { href: "/", label: "Home" },
  { href: "/diensten", label: "Diensten" },
  { href: "/prijzen", label: "Prijzen" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/over-ons", label: "Over ons" },
  { href: "/nieuws", label: "Nieuws" },
  { href: "/community", label: "Community" },
  { href: "/klantportaal", label: "Klantportaal" },
  { href: "/contact", label: "Contact" },
] as const;

export const navLinks = allNavLinks.filter((l) => SHOW_PORTFOLIO || l.href !== "/portfolio");
