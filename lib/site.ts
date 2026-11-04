export const site = {
  name: "Next Solutions",
  description:
    "Next Solutions is een digital agency voor Media, Software en Game Development. Discord bots, websites, FiveM scripts, Minecraft servers en branding.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  discordInvite: process.env.NEXT_PUBLIC_DISCORD_INVITE ?? "https://discord.gg/",
  email: "hello@nextsolutions.nl",
};

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/diensten", label: "Diensten" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/community", label: "Community" },
  { href: "/klantportaal", label: "Klantportaal" },
  { href: "/contact", label: "Contact" },
] as const;
