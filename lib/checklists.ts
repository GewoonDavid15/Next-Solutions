/** Free checklists (lead magnets). Visitors leave their name and email and get the full list. */

type L = { nl: string; en: string };

export interface Checklist {
  slug: string;
  emoji: string;
  title: L;
  intro: L;
  forWho: L;
  /** Service page that fits this checklist, for the call to action. */
  service: string;
  items: { title: L; text: L }[];
}

export const checklists: Checklist[] = [
  {
    slug: "instagram-tiktok",
    emoji: "📱",
    service: "social-media-management",
    title: { nl: "10 fouten op je Instagram en TikTok", en: "10 mistakes on your Instagram and TikTok" },
    intro: {
      nl: "Loop je profiel in tien minuten na en zie meteen waarom je bereik blijft hangen. Elke fout met wat je er vandaag nog aan doet.",
      en: "Check your profile in ten minutes and see why your reach is stuck. Every mistake comes with what you can do about it today.",
    },
    forWho: { nl: "Ondernemers en creators die zelf posten maar weinig groei zien.", en: "Business owners and creators who post themselves but see little growth." },
    items: [
      { title: { nl: "Je bio zegt niet wat je doet", en: "Your bio does not say what you do" }, text: { nl: "Iemand beslist in een paar seconden of hij je volgt. Zet in één zin wie je helpt en waarmee, en eindig met een duidelijke vervolgstap.", en: "People decide in seconds whether to follow you. Say in one sentence who you help and how, and end with a clear next step." } },
      { title: { nl: "Geen duidelijke link of actie", en: "No clear link or call to action" }, text: { nl: "Eén link die naar de belangrijkste pagina gaat werkt beter dan een lijst met tien knoppen. Wat moet iemand na het bekijken van je profiel doen?", en: "One link to your most important page works better than a list of ten buttons. What should someone do after seeing your profile?" } },
      { title: { nl: "Onregelmatig posten", en: "Posting irregularly" }, text: { nl: "Drie keer per week, elke week, wint van tien posts in één week en daarna niets. Kies een ritme dat je volhoudt en plan vooruit.", en: "Three times a week, every week, beats ten posts in one week and then nothing. Pick a rhythm you can keep up and plan ahead." } },
      { title: { nl: "De eerste seconden pakken niet", en: "The first seconds do not grab attention" }, text: { nl: "Bij video bepaalt de opening of iemand blijft kijken. Begin met de belofte of het resultaat, niet met een intro of logo.", en: "With video, the opening decides whether people keep watching. Start with the promise or the result, not an intro or logo." } },
      { title: { nl: "Alleen verkopen, nooit helpen", en: "Only selling, never helping" }, text: { nl: "Als elke post een aanbieding is, haken mensen af. Wissel af: tips, achter de schermen, resultaten van klanten en af en toe je aanbod.", en: "If every post is an offer, people tune out. Mix it up: tips, behind the scenes, client results and now and then your offer." } },
      { title: { nl: "Geen herkenbare stijl", en: "No recognisable style" }, text: { nl: "Vaste kleuren, lettertypes en een vaste opbouw zorgen dat mensen je post herkennen voordat ze je naam zien.", en: "Fixed colours, fonts and a consistent layout make people recognise your post before they see your name." } },
      { title: { nl: "Captions zonder doel", en: "Captions without a goal" }, text: { nl: "Geef elke caption één doel: reageren, opslaan, delen of klikken. Vraag daar ook gewoon om.", en: "Give every caption one goal: comment, save, share or click. And simply ask for it." } },
      { title: { nl: "Reacties blijven onbeantwoord", en: "Comments go unanswered" }, text: { nl: "Het eerste uur na een post is belangrijk. Reageer op reacties en berichten; dat bouwt een band op en laat het platform zien dat je post leeft.", en: "The first hour after posting matters. Reply to comments and messages; it builds a bond and shows the platform your post is alive." } },
      { title: { nl: "Trends zonder eigen draai", en: "Trends without your own twist" }, text: { nl: "Een trend kan bereik geven, maar alleen als het bij je merk past. Kopieer niet, maar vertaal de trend naar jouw vak.", en: "A trend can bring reach, but only if it fits your brand. Do not copy; translate the trend to your field." } },
      { title: { nl: "Je meet niets", en: "You do not measure anything" }, text: { nl: "Kijk elke maand welke posts het best liepen (bereik, opslaan, profielbezoeken) en maak daar meer van. Zonder cijfers is het gokken.", en: "Every month, check which posts did best (reach, saves, profile visits) and make more of those. Without numbers it is guesswork." } },
    ],
  },
  {
    slug: "discord-server",
    emoji: "🎮",
    service: "discord-bots",
    title: { nl: "Je Discord-server klaar voor groei", en: "Get your Discord server ready to grow" },
    intro: {
      nl: "Nieuwe leden binnenhalen is één ding, ze laten blijven is iets anders. Met deze checklist zie je wat er nog mist voordat je gaat promoten.",
      en: "Getting new members in is one thing, keeping them is another. This checklist shows what is still missing before you start promoting.",
    },
    forWho: { nl: "Community-eigenaren, gameservers en bedrijven met een Discord.", en: "Community owners, game servers and businesses with a Discord." },
    items: [
      { title: { nl: "Een duidelijk welkomstkanaal", en: "A clear welcome channel" }, text: { nl: "Een nieuw lid moet binnen tien seconden snappen waar de server over gaat en waar hij moet beginnen.", en: "A new member should understand within ten seconds what the server is about and where to start." } },
      { title: { nl: "Regels die kort en helder zijn", en: "Rules that are short and clear" }, text: { nl: "Vijf duidelijke regels werken beter dan een muur tekst. Zeg ook wat er gebeurt als iemand zich er niet aan houdt.", en: "Five clear rules work better than a wall of text. Also say what happens when someone breaks them." } },
      { title: { nl: "Verificatie tegen bots en raids", en: "Verification against bots and raids" }, text: { nl: "Een simpele verificatie houdt spamaccounts buiten en beschermt je leden. Zet ook de veiligheidsinstellingen van Discord zelf aan.", en: "Simple verification keeps spam accounts out and protects your members. Also turn on Discord's own safety settings." } },
      { title: { nl: "Rollen met een functie", en: "Roles with a purpose" }, text: { nl: "Rollen moeten iets betekenen: toegang, herkenning of meldingen. Te veel rollen zonder doel maken het rommelig.", en: "Roles should mean something: access, recognition or notifications. Too many roles without a purpose get messy." } },
      { title: { nl: "Niet te veel kanalen", en: "Not too many channels" }, text: { nl: "Lege kanalen voelen als een lege winkel. Begin klein en voeg kanalen toe als er echt behoefte aan is.", en: "Empty channels feel like an empty shop. Start small and add channels when there is real demand." } },
      { title: { nl: "Rechten goed ingesteld", en: "Permissions set up properly" }, text: { nl: "Geef bots en moderators alleen de rechten die ze nodig hebben. Controleer vooral wie @everyone mag taggen en wie kanalen mag beheren.", en: "Give bots and moderators only the permissions they need. Especially check who can mention @everyone and who can manage channels." } },
      { title: { nl: "Een ticketsysteem voor vragen", en: "A ticket system for questions" }, text: { nl: "Vragen en problemen horen niet in de algemene chat. Met tickets helpt je team mensen privé en houd je overzicht.", en: "Questions and problems do not belong in the general chat. With tickets your team helps people privately and you keep track." } },
      { title: { nl: "Iets om voor terug te komen", en: "A reason to come back" }, text: { nl: "Events, levels, giveaways of vaste momenten geven leden een reden om terug te komen in plaats van één keer te kijken.", en: "Events, levels, giveaways or recurring moments give members a reason to return instead of looking once." } },
      { title: { nl: "Moderatie die werkt als jij slaapt", en: "Moderation that works while you sleep" }, text: { nl: "Automod en logs vangen het meeste op. Zorg dat je kunt terugzien wat er gebeurde, ook als je er niet bij was.", en: "Automod and logs catch most problems. Make sure you can see what happened, even when you were not around." } },
      { title: { nl: "Een uitnodiging die verkoopt", en: "An invite that sells" }, text: { nl: "Je servericoon, banner en beschrijving zijn je etalage. Laat zien wat mensen er vinden voordat ze op 'joinen' klikken.", en: "Your server icon, banner and description are your shop window. Show what people will find before they click join." } },
    ],
  },
  {
    slug: "website",
    emoji: "🌐",
    service: "websites",
    title: { nl: "Website-checklist voor ondernemers", en: "Website checklist for business owners" },
    intro: {
      nl: "Een website die er mooi uitziet maar niets oplevert, heb je weinig aan. Check deze tien punten en zie waar bezoekers nu afhaken.",
      en: "A website that looks nice but brings in nothing is of little use. Check these ten points and see where visitors drop off.",
    },
    forWho: { nl: "Ondernemers met een (bijna) bestaande website die meer aanvragen willen.", en: "Business owners with an existing (or almost finished) website who want more enquiries." } ,
    items: [
      { title: { nl: "Binnen vijf seconden duidelijk", en: "Clear within five seconds" }, text: { nl: "Bovenaan je homepage staat wat je doet, voor wie, en wat de volgende stap is. Geen vage slogans.", en: "The top of your homepage says what you do, for whom, and what the next step is. No vague slogans." } },
      { title: { nl: "Snel op mobiel", en: "Fast on mobile" }, text: { nl: "De meeste bezoekers komen via hun telefoon. Test je site met PageSpeed Insights en verklein grote afbeeldingen.", en: "Most visitors come from their phone. Test your site with PageSpeed Insights and shrink large images." } },
      { title: { nl: "Eén duidelijke actie per pagina", en: "One clear action per page" }, text: { nl: "Contact opnemen, offerte aanvragen of afspraak maken: maak het opvallend en herhaal het onderaan de pagina.", en: "Get in touch, request a quote or book a call: make it stand out and repeat it at the bottom of the page." } },
      { title: { nl: "Bewijs dat je het kunt", en: "Proof that you can deliver" }, text: { nl: "Echte reviews, voorbeelden van je werk en wie je bent. Mensen kopen van mensen.", en: "Real reviews, examples of your work and who you are. People buy from people." } },
      { title: { nl: "Een contactformulier dat werkt", en: "A contact form that works" }, text: { nl: "Stuur jezelf een testaanvraag. Komt hij aan? Krijgt de bezoeker een bevestiging? Vraag niet meer dan nodig.", en: "Send yourself a test request. Does it arrive? Does the visitor get a confirmation? Do not ask more than you need." } },
      { title: { nl: "Vindbaar in Google", en: "Findable on Google" }, text: { nl: "Elke pagina een eigen titel en beschrijving, logische koppen en een sitemap. Meld je site aan bij Google Search Console.", en: "Every page has its own title and description, logical headings and a sitemap. Add your site to Google Search Console." } },
      { title: { nl: "Goed te lezen", en: "Easy to read" }, text: { nl: "Genoeg contrast, korte alinea's en tekst die je op een telefoon zonder inzoomen kunt lezen.", en: "Enough contrast, short paragraphs and text you can read on a phone without zooming in." } },
      { title: { nl: "Veilig en up-to-date", en: "Secure and up to date" }, text: { nl: "Een slotje (https), bijgewerkte plugins en een back-up. Een gehackte site kost je meer dan het bijhouden.", en: "A padlock (https), updated plugins and a backup. A hacked site costs you more than maintenance does." } },
      { title: { nl: "Privacy op orde", en: "Privacy in order" }, text: { nl: "Een privacyverklaring die klopt met wat je echt doet, en alleen cookies die je nodig hebt.", en: "A privacy policy that matches what you actually do, and only the cookies you need." } },
      { title: { nl: "Je weet wat werkt", en: "You know what works" }, text: { nl: "Meet hoeveel bezoekers een aanvraag doen. Zo zie je of een aanpassing helpt, in plaats van te gokken.", en: "Measure how many visitors send a request. That way you see whether a change helps, instead of guessing." } },
    ],
  },
];

export const checklistBySlug = (slug: string) => checklists.find((c) => c.slug === slug) ?? null;
