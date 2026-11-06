/**
 * Extra content for the page per service (/diensten/[slug]). The order matches `services` in lib/data.ts.
 * `contact` is the matching option in the quote form, `woorden` are used to pick related reviews.
 */

type L = { nl: string; en: string };
type LL = { nl: string[]; en: string[] };

export interface ServicePage {
  slug: string;
  contact: string;
  woorden: string[];
  intro: L;
  voorWie: LL;
  faq: { nl: { question: string; answer: string }[]; en: { question: string; answer: string }[] };
}

export const servicePages: ServicePage[] = [
  {
    slug: "discord-bots",
    contact: "discord-bot",
    woorden: ["bot", "discord", "ticket"],
    intro: {
      nl: "Een bot die precies doet wat jouw server nodig heeft: tickets, moderatie, verificatie, giveaways, een eigen dashboard of koppelingen met je website. Gebouwd in discord.js, met een webdashboard waarin je alles zelf aanpast.",
      en: "A bot that does exactly what your server needs: tickets, moderation, verification, giveaways, its own dashboard or integrations with your website. Built with discord.js, with a web dashboard where you adjust everything yourself.",
    },
    voorWie: {
      nl: ["Communities die support en moderatie willen automatiseren", "Bedrijven die klanten via Discord helpen", "Gameservers die verificatie, rollen en statistieken nodig hebben"],
      en: ["Communities that want to automate support and moderation", "Businesses that help clients through Discord", "Game servers that need verification, roles and statistics"],
    },
    faq: {
      nl: [
        { question: "Kan ik de bot zelf aanpassen?", answer: "Ja. Je krijgt een webdashboard waarin je teksten, kanalen, rollen en instellingen zelf wijzigt, zonder te programmeren." },
        { question: "Waar draait de bot?", answer: "Bij voorkeur op onze hosting, zodat wij hem online houden en updaten. Je kunt hem ook zelf hosten; dan leveren we hem op met uitleg." },
      ],
      en: [
        { question: "Can I adjust the bot myself?", answer: "Yes. You get a web dashboard where you change texts, channels, roles and settings yourself, without programming." },
        { question: "Where does the bot run?", answer: "Preferably on our hosting, so we keep it online and up to date. You can also host it yourself; we then deliver it with instructions." },
      ],
    },
  },
  {
    slug: "websites",
    contact: "website",
    woorden: ["website", "site", "web"],
    intro: {
      nl: "Snelle, moderne websites en web-apps, gebouwd met Next.js en Tailwind. Van een strakke landingspagina tot een klantportaal met inloggen via Discord, gekoppeld aan je bot.",
      en: "Fast, modern websites and web apps, built with Next.js and Tailwind. From a sleek landing page to a client portal with Discord login, connected to your bot.",
    },
    voorWie: {
      nl: ["Communities die een eigen site willen naast hun Discord", "Ondernemers die een snelle, vindbare website zoeken", "Projecten die een portaal of dashboard voor gebruikers nodig hebben"],
      en: ["Communities that want their own site next to their Discord", "Entrepreneurs looking for a fast, findable website", "Projects that need a portal or dashboard for users"],
    },
    faq: {
      nl: [
        { question: "Kan ik zelf teksten aanpassen?", answer: "Ja, als je dat wilt koppelen we een eenvoudig beheersysteem, zodat je teksten en afbeeldingen zelf bijwerkt." },
        { question: "Regelen jullie ook hosting en een domeinnaam?", answer: "We helpen je met hosting en het koppelen van je domein. De domeinnaam staat op jouw naam." },
      ],
      en: [
        { question: "Can I edit texts myself?", answer: "Yes, if you want we connect a simple content system so you update texts and images yourself." },
        { question: "Do you arrange hosting and a domain name?", answer: "We help you with hosting and connecting your domain. The domain name is registered in your name." },
      ],
    },
  },
  {
    slug: "automatisering",
    contact: "automation",
    woorden: ["automatisering", "koppeling", "api", "webhook"],
    intro: {
      nl: "Laat je tools met elkaar praten. Met API's, webhooks en geplande taken automatiseren we terugkerend werk, zodat jij tijd overhoudt voor de dingen die ertoe doen.",
      en: "Let your tools talk to each other. With APIs, webhooks and scheduled tasks we automate repetitive work, so you have time left for what matters.",
    },
    voorWie: {
      nl: ["Wie elke week hetzelfde handmatige werk doet", "Teams die gegevens tussen systemen overtypen", "Communities die meldingen uit andere diensten in Discord willen"],
      en: ["Anyone doing the same manual work every week", "Teams copying data between systems", "Communities that want notifications from other services in Discord"],
    },
    faq: {
      nl: [
        { question: "Met welke tools kunnen jullie koppelen?", answer: "Met bijna alles dat een API of webhooks heeft. We bekijken vooraf samen wat er mogelijk is." },
        { question: "Wat als een koppeling stopt met werken?", answer: "We bouwen meldingen in, zodat we het zien als er iets misgaat, en lossen het op binnen de nazorg." },
      ],
      en: [
        { question: "Which tools can you connect?", answer: "Almost anything that has an API or webhooks. We look together at what's possible first." },
        { question: "What if an integration stops working?", answer: "We build in alerts so we see when something goes wrong, and fix it within the aftercare period." },
      ],
    },
  },
  {
    slug: "fivem-scripts",
    contact: "fivem",
    woorden: ["fivem", "script", "esx", "qbcore"],
    intro: {
      nl: "Eigen FiveM-scripts voor ESX en QBCore, met een strakke NUI-interface en aandacht voor prestaties. Geen kant-en-klare scripts, maar precies wat jouw server nodig heeft.",
      en: "Custom FiveM scripts for ESX and QBCore, with a sleek NUI interface and attention to performance. No off-the-shelf scripts, but exactly what your server needs.",
    },
    voorWie: {
      nl: ["Roleplay-servers die zich willen onderscheiden", "Servers met prestatieproblemen door zware resources", "Teams die een idee hebben maar geen developer"],
      en: ["Roleplay servers that want to stand out", "Servers with performance issues caused by heavy resources", "Teams with an idea but no developer"],
    },
    faq: {
      nl: [
        { question: "Welk framework gebruiken jullie?", answer: "ESX of QBCore, afhankelijk van jouw server. Vertel ons welke versie je draait." },
        { question: "Krijg ik de broncode?", answer: "Ja, na betaling is het script van jou, zoals in onze voorwaarden staat." },
      ],
      en: [
        { question: "Which framework do you use?", answer: "ESX or QBCore, depending on your server. Tell us which version you run." },
        { question: "Do I get the source code?", answer: "Yes, after payment the script is yours, as described in our terms." },
      ],
    },
  },
  {
    slug: "minecraft-servers",
    contact: "minecraft",
    woorden: ["minecraft", "plugin", "server"],
    intro: {
      nl: "Een complete Minecraft-server of netwerk: installatie, plugins, configuratie, anti-cheat en prestatie-tuning. Klaar voor je spelers, met documentatie bij de oplevering.",
      en: "A complete Minecraft server or network: installation, plugins, configuration, anti-cheat and performance tuning. Ready for your players, with documentation at delivery.",
    },
    voorWie: {
      nl: ["Nieuwe servers die goed willen starten", "Bestaande servers die lag of rommelige plugins hebben", "Netwerken met meerdere servers achter een proxy"],
      en: ["New servers that want a good start", "Existing servers with lag or messy plugins", "Networks with several servers behind a proxy"],
    },
    faq: {
      nl: [
        { question: "Maken jullie ook eigen plugins?", answer: "Ja, als een bestaande plugin niet volstaat, schrijven we er een voor je." },
        { question: "Kunnen jullie de server ook beheren?", answer: "Ja, met ons pakket Hosting & beheer houden we hem online en up-to-date." },
      ],
      en: [
        { question: "Do you also make custom plugins?", answer: "Yes, if an existing plugin isn't enough, we write one for you." },
        { question: "Can you also manage the server?", answer: "Yes, with our Hosting & management package we keep it online and up to date." },
      ],
    },
  },
  {
    slug: "hosting-en-beheer",
    contact: "hosting",
    woorden: ["hosting", "beheer", "server"],
    intro: {
      nl: "Wij houden je gameserver of bot online. Met dagelijkse back-ups, monitoring en updates, zodat jij je kunt richten op je community.",
      en: "We keep your game server or bot online. With daily backups, monitoring and updates, so you can focus on your community.",
    },
    voorWie: {
      nl: ["Wie geen zin heeft in servers en updates", "Communities die betrouwbaar online willen zijn", "Klanten van wie we de bot of server hebben gebouwd"],
      en: ["Anyone who doesn't want to deal with servers and updates", "Communities that want to be reliably online", "Clients whose bot or server we built"],
    },
    faq: {
      nl: [
        { question: "Hoe zie ik of alles werkt?", answer: "Op onze statuspagina zie je live hoe onze diensten draaien." },
        { question: "Kan ik maandelijks opzeggen?", answer: "Ja, hosting is een maandabonnement dat je per maand kunt opzeggen." },
      ],
      en: [
        { question: "How do I see whether everything works?", answer: "Our status page shows live how our services are running." },
        { question: "Can I cancel monthly?", answer: "Yes, hosting is a monthly subscription you can cancel per month." },
      ],
    },
  },
  {
    slug: "social-media-management",
    contact: "social",
    woorden: ["social", "instagram", "tiktok", "media"],
    intro: {
      nl: "Wij runnen je socials: contentkalender, inplannen en posten, reageren op comments en DM's, en elke maand een rapport. Jij keurt alles goed in het klantportaal.",
      en: "We run your socials: content calendar, scheduling and posting, replying to comments and DMs, and a report every month. You approve everything in the client portal.",
    },
    voorWie: {
      nl: ["Ondernemers zonder tijd voor social media", "Merken en communities die willen groeien", "Wie consistent wil posten zonder er zelf naar om te kijken"],
      en: ["Entrepreneurs without time for social media", "Brands and communities that want to grow", "Anyone who wants to post consistently without thinking about it"],
    },
    faq: {
      nl: [
        { question: "Op welke platformen?", answer: "Instagram, TikTok, YouTube, LinkedIn, X en Facebook." },
        { question: "Gaat er iets online zonder dat ik het zie?", answer: "Nee, je keurt de contentkalender goed voordat we posten." },
      ],
      en: [
        { question: "On which platforms?", answer: "Instagram, TikTok, YouTube, LinkedIn, X and Facebook." },
        { question: "Does anything go live without me seeing it?", answer: "No, you approve the content calendar before we post." },
      ],
    },
  },
  {
    slug: "content-creatie",
    contact: "content",
    woorden: ["content", "reel", "tiktok", "video"],
    intro: {
      nl: "Reels, TikToks, Shorts, carrousels en posts die opvallen. Gemonteerd, ondertiteld en afgestemd op elk platform en op je merk.",
      en: "Reels, TikToks, Shorts, carousels and posts that stand out. Edited, subtitled and tailored to every platform and to your brand.",
    },
    voorWie: {
      nl: ["Wie zelf filmt maar geen tijd heeft om te monteren", "Merken die vaker video willen posten", "Accounts die er professioneler uit willen zien"],
      en: ["Anyone who films but has no time to edit", "Brands that want to post video more often", "Accounts that want to look more professional"],
    },
    faq: {
      nl: [
        { question: "Moet ik zelf beeld aanleveren?", answer: "Dat kan via het klantportaal. Heb je geen beeld, dan bespreken we samen wat er nodig is." },
        { question: "Kan ik losse content bestellen?", answer: "Ja, met Content op maat bestel je per opdracht, zonder abonnement." },
      ],
      en: [
        { question: "Do I need to supply footage?", answer: "You can, through the client portal. If you have none, we discuss together what's needed." },
        { question: "Can I order standalone content?", answer: "Yes, with Custom content you order per job, without a subscription." },
      ],
    },
  },
  {
    slug: "strategie-en-groei",
    contact: "strategie",
    woorden: ["strategie", "groei", "social"],
    intro: {
      nl: "Een plan dat werkt: wie is je doelgroep, waar post je over, wat doen je concurrenten en hoe groei je per platform. We sturen bij op basis van de cijfers.",
      en: "A plan that works: who is your audience, what do you post about, what are your competitors doing and how do you grow per platform. We adjust based on the numbers.",
    },
    voorWie: {
      nl: ["Accounts die wel posten maar niet groeien", "Nieuwe merken die goed willen beginnen", "Wie zelf wil posten met een duidelijk plan"],
      en: ["Accounts that post but don't grow", "New brands that want a good start", "Anyone who wants to post themselves with a clear plan"],
    },
    faq: {
      nl: [
        { question: "Krijg ik een uitgeschreven plan?", answer: "Ja, met doelgroep, contentpijlers, formats, planning en concurrentieanalyse." },
        { question: "Kan ik het plan zelf uitvoeren?", answer: "Zeker. Wil je het later toch uitbesteden, dan sluit Social Media Management er naadloos op aan." },
      ],
      en: [
        { question: "Do I get a written plan?", answer: "Yes, with audience, content pillars, formats, schedule and competitor analysis." },
        { question: "Can I carry out the plan myself?", answer: "Of course. If you want to outsource it later, Social Media Management fits right in." },
      ],
    },
  },
  {
    slug: "branding",
    contact: "branding",
    woorden: ["logo", "huisstijl", "branding"],
    intro: {
      nl: "Een herkenbaar merk: logo, kleuren, typografie en een brand guide, zodat je website, socials en Discord er als één geheel uitzien.",
      en: "A recognisable brand: logo, colours, typography and a brand guide, so your website, socials and Discord look like one whole.",
    },
    voorWie: {
      nl: ["Nieuwe projecten die een gezicht nodig hebben", "Communities die er professioneler uit willen zien", "Merken die op social media herkenbaar willen zijn"],
      en: ["New projects that need a face", "Communities that want to look more professional", "Brands that want to be recognisable on social media"],
    },
    faq: {
      nl: [
        { question: "Hoeveel feedbackrondes krijg ik?", answer: "Dat staat per pakket in de offerte; bij een logo zijn dat er twee." },
        { question: "Welke bestanden krijg ik?", answer: "Bestanden voor web en print, in kleur- en zwart-witvarianten." },
      ],
      en: [
        { question: "How many feedback rounds do I get?", answer: "That's stated per package in the quote; for a logo it's two." },
        { question: "Which files do I get?", answer: "Files for web and print, in colour and black-and-white variants." },
      ],
    },
  },
  {
    slug: "ui-ux-design",
    contact: "uiux",
    woorden: ["design", "ui", "ux", "ontwerp"],
    intro: {
      nl: "Een doordacht ontwerp voordat er code wordt geschreven: wireframes, een klikbaar prototype en een design system dat je developers direct kunnen gebruiken.",
      en: "A well thought-out design before code is written: wireframes, a clickable prototype and a design system your developers can use straight away.",
    },
    voorWie: {
      nl: ["Startups die een app of platform willen bouwen", "Websites die beter moeten converteren", "Teams die eerst willen testen voordat ze bouwen"],
      en: ["Startups that want to build an app or platform", "Websites that need to convert better", "Teams that want to test before they build"],
    },
    faq: {
      nl: [
        { question: "In welk programma ontwerpen jullie?", answer: "In Figma, zodat je alles kunt bekijken, becommentariëren en overdragen." },
        { question: "Kunnen jullie het ontwerp ook bouwen?", answer: "Ja, ons software-team bouwt het ontwerp als website of web-app." },
      ],
      en: [
        { question: "Which tool do you design in?", answer: "Figma, so you can view, comment on and hand over everything." },
        { question: "Can you build the design as well?", answer: "Yes, our software team builds the design as a website or web app." },
      ],
    },
  },
];

export const servicePageBySlug = (slug: string) => {
  const i = servicePages.findIndex((p) => p.slug === slug);
  return i >= 0 ? { page: servicePages[i], index: i } : null;
};
