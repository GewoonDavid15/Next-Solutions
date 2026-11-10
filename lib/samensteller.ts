/** Building blocks per service for the package builder (/samenstellen). Prices stay "on request". */
type L = { nl: string; en: string };

export const featureOptions: Record<string, L[]> = {
  "discord-bot": [
    { nl: "Ticketsysteem", en: "Ticket system" }, { nl: "Moderatie en automod", en: "Moderation and automod" }, { nl: "Verificatie (captcha)", en: "Verification (captcha)" },
    { nl: "Levels en XP", en: "Levels and XP" }, { nl: "Giveaways", en: "Giveaways" }, { nl: "Welkomstberichten en rollen", en: "Welcome messages and roles" },
    { nl: "Dashboard op een website", en: "Web dashboard" }, { nl: "Koppeling met een andere dienst (API)", en: "Integration with another service (API)" },
  ],
  website: [
    { nl: "Bedrijfswebsite (meerdere pagina's)", en: "Business website (multiple pages)" }, { nl: "Landingspagina", en: "Landing page" }, { nl: "Contact- of offerteformulier", en: "Contact or quote form" },
    { nl: "Klantportaal met inloggen", en: "Client portal with login" }, { nl: "Blog of nieuws", en: "Blog or news" }, { nl: "Meertalig (NL/EN)", en: "Multilingual (NL/EN)" },
    { nl: "Webshop", en: "Web shop" }, { nl: "Vindbaar in Google (SEO)", en: "Found on Google (SEO)" },
  ],
  automation: [
    { nl: "Formulieren automatisch verwerken", en: "Process forms automatically" }, { nl: "Koppeling tussen tools", en: "Connect tools" }, { nl: "Automatische e-mails", en: "Automatic emails" },
    { nl: "Rapportages", en: "Reports" }, { nl: "Discord-koppeling", en: "Discord integration" },
  ],
  fivem: [
    { nl: "Nieuw script op maat", en: "New custom script" }, { nl: "Bestaand script aanpassen", en: "Adjust an existing script" }, { nl: "UI / menu", en: "UI / menu" },
    { nl: "Database-koppeling", en: "Database integration" }, { nl: "Discord-koppeling", en: "Discord integration" },
  ],
  minecraft: [
    { nl: "Server opzetten", en: "Server setup" }, { nl: "Plugins installeren en instellen", en: "Install and configure plugins" }, { nl: "Eigen plugin", en: "Custom plugin" },
    { nl: "Spawn / build", en: "Spawn / build" }, { nl: "Discord-koppeling", en: "Discord integration" },
  ],
  hosting: [
    { nl: "Bot hosten", en: "Bot hosting" }, { nl: "Website hosten", en: "Website hosting" }, { nl: "Gameserver hosten", en: "Game server hosting" },
    { nl: "Onderhoud en updates", en: "Maintenance and updates" }, { nl: "Back-ups en monitoring", en: "Backups and monitoring" },
  ],
  social: [
    { nl: "Instagram", en: "Instagram" }, { nl: "TikTok", en: "TikTok" }, { nl: "YouTube", en: "YouTube" }, { nl: "LinkedIn", en: "LinkedIn" },
    { nl: "Contentplanning", en: "Content planning" }, { nl: "Reageren op berichten", en: "Replying to messages" }, { nl: "Maandrapport", en: "Monthly report" },
  ],
  content: [
    { nl: "Foto's", en: "Photos" }, { nl: "Korte video's (Reels/TikTok)", en: "Short videos (Reels/TikTok)" }, { nl: "Grafisch ontwerp", en: "Graphic design" },
    { nl: "Teksten / captions", en: "Copy / captions" }, { nl: "Thumbnails", en: "Thumbnails" },
  ],
  strategie: [
    { nl: "Account-check", en: "Account review" }, { nl: "Contentstrategie", en: "Content strategy" }, { nl: "Doelgroep en concurrenten", en: "Audience and competitors" },
    { nl: "Groeiplan", en: "Growth plan" },
  ],
  branding: [
    { nl: "Logo", en: "Logo" }, { nl: "Kleuren en lettertypes", en: "Colours and fonts" }, { nl: "Huisstijlgids", en: "Brand guide" }, { nl: "Social media-templates", en: "Social media templates" },
  ],
  uiux: [
    { nl: "Ontwerp van een website", en: "Website design" }, { nl: "Ontwerp van een app", en: "App design" }, { nl: "Prototype", en: "Prototype" }, { nl: "Gebruikerstest", en: "User testing" },
  ],
};
