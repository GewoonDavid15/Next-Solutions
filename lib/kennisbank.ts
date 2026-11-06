/**
 * Help articles for /kennisbank. Plain text with light formatting:
 * "## " heading, "- " bullet, "1. " numbered step, anything else is a paragraph.
 */

type L = { nl: string; en: string };

export interface Article {
  slug: string;
  categorie: "start" | "betalen" | "support" | "portaal" | "community";
  icon: string;
  titel: L;
  samenvatting: L;
  inhoud: L;
}

export const CATEGORIES: Record<Article["categorie"], L> = {
  start: { nl: "Aan de slag", en: "Getting started" },
  betalen: { nl: "Offertes & betalen", en: "Quotes & payment" },
  support: { nl: "Tickets & support", en: "Tickets & support" },
  portaal: { nl: "Klantportaal & profiel", en: "Client portal & profile" },
  community: { nl: "Discord & community", en: "Discord & community" },
};

export const articles: Article[] = [
  {
    slug: "hoe-werkt-een-project",
    categorie: "start",
    icon: "🚀",
    titel: { nl: "Hoe werkt een project bij Next Solutions?", en: "How does a project at Next Solutions work?" },
    samenvatting: { nl: "Van eerste idee tot oplevering, stap voor stap.", en: "From first idea to delivery, step by step." },
    inhoud: {
      nl: `Elk project volgt dezelfde duidelijke stappen. Je weet altijd waar je aan toe bent.
## De stappen
1. Je vraagt een offerte aan via het formulier op de website, of je opent een ticket in onze Discord.
2. We bespreken je idee in je ticket. Je praat direct met de maker van je project.
3. Je krijgt een offerte met wat je krijgt, de prijs en de levertijd.
4. Je geeft akkoord, in je ticket of in het klantportaal, en betaalt.
5. We gaan bouwen. De voortgang volg je live in het klantportaal, met mijlpalen en updates.
6. Bij elke fase kun je akkoord geven of om een aanpassing vragen.
7. Oplevering! Je bestanden staan in je portaal en je ontvangt alles wat is afgesproken.
## Tip
Weet je nog niet precies wat je wilt? Plan een kennismakingscall in via het klantportaal.`,
      en: `Every project follows the same clear steps, so you always know where you stand.
## The steps
1. Request a quote through the form on the website, or open a ticket in our Discord.
2. We discuss your idea in your ticket. You talk directly to the maker of your project.
3. You receive a quote with what you get, the price and the delivery time.
4. You accept it, in your ticket or in the client portal, and pay.
5. We start building. You follow the progress live in the client portal, with milestones and updates.
6. At every phase you can approve or ask for a change.
7. Delivery! Your files are in your portal and you receive everything we agreed on.
## Tip
Not sure yet what you want? Schedule an introduction call from the client portal.`,
    },
  },
  {
    slug: "offerte-accepteren-en-betalen",
    categorie: "betalen",
    icon: "💳",
    titel: { nl: "Een offerte accepteren en betalen", en: "Accepting and paying a quote" },
    samenvatting: { nl: "Akkoord geven, betalen en je betaalbewijs ontvangen.", en: "Accept, pay and receive your payment receipt." },
    inhoud: {
      nl: `Je offerte verschijnt in je ticket in Discord en in het klantportaal onder Offertes & bonnen.
## Akkoord geven
- In Discord: klik op de knop onder de offerte.
- Op de website: open het klantportaal, ga naar Offertes & bonnen en klik op Akkoord geven.
Een offerte is een bepaalde tijd geldig. De datum staat bij de offerte.
## Betalen
Na je akkoord zie je direct hoe je betaalt. Je betaalt de volledige prijs in één keer, zonder aanbetaling. Vermeld het offertenummer bij je betaling.
## Betaalbewijs
Zodra je betaling binnen is, krijg je een betaalbewijs als PDF: in je ticket, als DM en in het klantportaal.`,
      en: `Your quote appears in your ticket in Discord and in the client portal under Quotes & receipts.
## Accepting
- In Discord: click the button below the quote.
- On the website: open the client portal, go to Quotes & receipts and click Accept quote.
A quote is valid for a limited time. The date is shown with the quote.
## Paying
After accepting you immediately see how to pay. You pay the full price at once, without a deposit. Mention the quote number with your payment.
## Payment receipt
Once your payment is in, you receive a PDF payment receipt: in your ticket, by DM and in the client portal.`,
    },
  },
  {
    slug: "wat-kost-het",
    categorie: "betalen",
    icon: "🧮",
    titel: { nl: "Wat kost een project?", en: "What does a project cost?" },
    samenvatting: { nl: "Hoe onze prijzen tot stand komen.", en: "How our prices are put together." },
    inhoud: {
      nl: `Elk project is anders, daarom krijg je altijd een offerte op maat.
- Op de pagina Pakketten zie je wat we bieden per afdeling.
- Staat de prijscalculator aan, dan zie je daar een indicatie "vanaf". Die indicatie gaat mee met je aanvraag.
- De echte prijs staat in je offerte. Je betaalt pas na akkoord.`,
      en: `Every project is different, so you always get a tailored quote.
- The Packages page shows what we offer per department.
- When the price calculator is available, it shows an estimate "from". That estimate is sent along with your request.
- The actual price is in your quote. You only pay after accepting it.`,
    },
  },
  {
    slug: "social-media-beheer",
    categorie: "start",
    icon: "📱",
    titel: { nl: "Hoe werkt social media beheer?", en: "How does social media management work?" },
    samenvatting: { nl: "Van analyse tot maandrapport, en wat we van je nodig hebben.", en: "From analysis to monthly report, and what we need from you." },
    inhoud: {
      nl: `We werken op Instagram, TikTok, YouTube, LinkedIn, X en Facebook.
## De stappen
1. Je vraagt het aan via de pagina Social media en zet links naar je accounts erbij.
2. We bekijken je accounts, doelgroep en concurrenten.
3. Je krijgt een strategie en een contentplan.
4. Wij maken de content. Je keurt de contentkalender goed voordat er iets online gaat.
5. We plannen in en posten, en bij het pakket Social Groei reageren we ook op comments en DM's.
6. Elke maand krijg je een rapport met resultaten en advies.
## Wat we van je nodig hebben
- Toegang tot je accounts. Liefst door ons toe te voegen als beheerder of teamlid via de zakelijke tools van het platform, zodat je je wachtwoord niet hoeft te delen.
- Je logo en huisstijl, als je die hebt. Nog niet? Dan kunnen we die ook maken.
- Eigen foto's of video's, als je die wilt gebruiken.
## Pakketten
Social Start (1 platform), Social Groei (meerdere platformen, video's en community management) en Content op maat (per opdracht). Prijzen zijn op aanvraag.`,
      en: `We work on Instagram, TikTok, YouTube, LinkedIn, X and Facebook.
## The steps
1. Request it on the Social media page and add links to your accounts.
2. We look at your accounts, audience and competitors.
3. You receive a strategy and a content plan.
4. We create the content. You approve the content calendar before anything goes live.
5. We schedule and post, and with the Social Growth package we also reply to comments and DMs.
6. Every month you receive a report with results and advice.
## What we need from you
- Access to your accounts. Preferably by adding us as an admin or team member through the platform's business tools, so you don't have to share your password.
- Your logo and brand identity, if you have them. Not yet? We can make those too.
- Your own photos or videos, if you'd like to use them.
## Packages
Social Start (1 platform), Social Growth (several platforms, videos and community management) and Custom content (per job). Prices are on request.`,
    },
  },
  {
    slug: "ticket-openen",
    categorie: "support",
    icon: "🎫",
    titel: { nl: "Een ticket openen en reageren", en: "Opening and answering a ticket" },
    samenvatting: { nl: "Via Discord of de website, en hoe lang een ticket open blijft.", en: "Through Discord or the website, and how long a ticket stays open." },
    inhoud: {
      nl: `Een ticket is je privékanaal met het team in onze Discord.
## Openen
- In Discord: kies een afdeling in het ticketpaneel.
- Op de website: klantportaal → Tickets → Ticket openen.
## Reageren
Je kunt in Discord antwoorden, maar ook in het klantportaal: klik bij je ticket op Berichten.
## Automatisch sluiten
Wacht het team op jouw antwoord? Na 24 uur zonder reactie krijg je een herinnering, en na 48 uur sluit het ticket automatisch. Je kunt altijd een nieuw ticket openen.
## Transcript
Na het sluiten staat het volledige gesprek als transcript in je klantportaal.`,
      en: `A ticket is your private channel with the team in our Discord.
## Opening
- In Discord: pick a department in the ticket panel.
- On the website: client portal → Tickets → Open ticket.
## Replying
You can reply in Discord, or in the client portal: click Messages on your ticket.
## Automatic closing
Is the team waiting for your reply? After 24 hours without a response you get a reminder, and after 48 hours the ticket closes automatically. You can always open a new ticket.
## Transcript
After closing, the full conversation is available as a transcript in your client portal.`,
    },
  },
  {
    slug: "feedback-en-revisies",
    categorie: "support",
    icon: "🔁",
    titel: { nl: "Feedback geven en een revisie vragen", en: "Giving feedback and asking for a revision" },
    samenvatting: { nl: "Akkoord geven op een fase of om een aanpassing vragen.", en: "Approve a phase or ask for a change." },
    inhoud: {
      nl: `Open in het klantportaal je project en kies Projectruimte openen.
- Tevreden? Klik op Akkoord.
- Moet er iets anders? Klik op Revisie vragen en beschrijf wat je anders wilt.
Je feedback komt direct in het projectkanaal bij het team.`,
      en: `Open your project in the client portal and choose Open project room.
- Happy? Click Approve.
- Should something change? Click Request revision and describe what you'd like to be different.
Your feedback goes straight to the team in the project channel.`,
    },
  },
  {
    slug: "klantportaal",
    categorie: "portaal",
    icon: "🧭",
    titel: { nl: "Het klantportaal", en: "The client portal" },
    samenvatting: { nl: "Alles over je projecten, tickets en bestanden op één plek.", en: "Your projects, tickets and files in one place." },
    inhoud: {
      nl: `Log in met Discord op de pagina Klantportaal. Je ziet alleen je eigen gegevens.
- Overzicht: je lopende projecten, niveau en snelle acties.
- Projecten: voortgang, mijlpalen en de projectruimte.
- Tickets: open tickets, berichten en transcripts.
- Offertes & bonnen: offertes accepteren en betaalbewijzen downloaden.
- Bestanden: alles wat we voor je hebben klaargezet.
- Afspraken: een call plannen.
- Meldingen: alles wat er voor jou is gebeurd.
- Profiel en Instellingen: je profiel en e-mailmeldingen.`,
      en: `Log in with Discord on the Client portal page. You only see your own data.
- Overview: your active projects, level and quick actions.
- Projects: progress, milestones and the project room.
- Tickets: open tickets, messages and transcripts.
- Quotes & receipts: accept quotes and download payment receipts.
- Files: everything we prepared for you.
- Appointments: schedule a call.
- Notifications: everything that happened for you.
- Profile and Settings: your profile and email notifications.`,
    },
  },
  {
    slug: "profiel-badges-niveaus",
    categorie: "portaal",
    icon: "🏅",
    titel: { nl: "Je profiel, badges en niveaus", en: "Your profile, badges and levels" },
    samenvatting: { nl: "Wat je kunt instellen en hoe je badges verdient.", en: "What you can set up and how you earn badges." },
    inhoud: {
      nl: `Je profiel combineert je Discord-gegevens met wat je zelf invult.
## Uit Discord
Je naam, avatar, banner, avatar-decoratie, naamplaatje en servertag komen live uit Discord. Nitro zie je na het inloggen.
## Zelf invullen
Discord deelt je bio niet met websites, dus je schrijft je "Over mij" in het portaal. Je kunt ook een korte tekst, je bedrijf, website en socials toevoegen.
## Openbaar profiel
Zet je profiel op openbaar en kies een profielnaam. Het staat dan op nextsolutionshq.nl/u/jouw-naam.
## Badges en niveaus
Je verdient badges voor bijvoorbeeld je eerste opgeleverde project, een review, invites of het boosten van de server. Met elke stap verdien je XP en stijg je in niveau.`,
      en: `Your profile combines your Discord data with what you fill in yourself.
## From Discord
Your name, avatar, banner, avatar decoration, nameplate and server tag come live from Discord. Nitro shows up after you log in.
## Fill in yourself
Discord doesn't share your bio with websites, so you write your "About me" in the portal. You can also add a short line, your company, website and socials.
## Public profile
Make your profile public and pick a profile name. It will be available at nextsolutionshq.nl/u/your-name.
## Badges and levels
You earn badges for things like your first delivered project, a review, invites or boosting the server. Every step earns XP and raises your level.`,
    },
  },
  {
    slug: "afspraak-plannen",
    categorie: "portaal",
    icon: "📅",
    titel: { nl: "Een afspraak (call) plannen", en: "Scheduling a call" },
    samenvatting: { nl: "Kies zelf een moment voor een gesprek via Discord.", en: "Pick a moment for a call on Discord." },
    inhoud: {
      nl: `Ga in het klantportaal naar Afspraken.
1. Kies een dag en een tijd. Alle tijden zijn Nederlandse tijd.
2. Kies een onderwerp en vertel kort wat je wilt bespreken.
3. Klik op Inplannen.
Je krijgt een DM ter bevestiging en een uur van tevoren een herinnering. We bellen je via Discord, dus zorg dat je in de server zit. Kan het toch niet? Annuleer de afspraak in het portaal.`,
      en: `Go to Appointments in the client portal.
1. Pick a day and a time. All times are Dutch time.
2. Choose a topic and briefly tell us what you'd like to discuss.
3. Click Schedule.
You get a DM to confirm and a reminder an hour before. We call you on Discord, so make sure you're in the server. Can't make it? Cancel the appointment in the portal.`,
    },
  },
  {
    slug: "meldingen",
    categorie: "portaal",
    icon: "🔔",
    titel: { nl: "Meldingen en e-mail", en: "Notifications and email" },
    samenvatting: { nl: "Mis geen antwoord, update of offerte.", en: "Never miss a reply, update or quote." },
    inhoud: {
      nl: `Ben je ingelogd, dan zie je rechtsboven een bel met je meldingen: antwoorden op tickets, projectupdates, nieuwe offertes, bestanden en afspraken.
Wil je ook een e-mail? Zet e-mailmeldingen aan in het klantportaal onder Instellingen en kies welke meldingen je wilt ontvangen.`,
      en: `When you're logged in, you'll see a bell at the top right with your notifications: ticket replies, project updates, new quotes, files and appointments.
Want an email too? Turn on email notifications in the client portal under Settings and choose which ones you'd like to receive.`,
    },
  },
  {
    slug: "verificatie-en-invites",
    categorie: "community",
    icon: "✅",
    titel: { nl: "Verificatie, invites en giveaways", en: "Verification, invites and giveaways" },
    samenvatting: { nl: "Zo kom je de server in en verdien je beloningen.", en: "How to get into the server and earn rewards." },
    inhoud: {
      nl: `## Verificatie
Nieuwe leden zien eerst alleen het welkomstdeel en het verificatiekanaal. Klik op Verifiëren en kies het juiste plaatje. Daarna zie je de hele community.
## Invites
Nodig je vrienden uit met je eigen invite-link. Iedereen die via jouw link joint en blijft, telt mee. Je stand zie je in het klantportaal en op de community-pagina.
## Giveaways
Doe mee met een klik op de knop in het giveaways-kanaal. Soms geldt een voorwaarde, zoals een rol of een minimaal aantal invites.`,
      en: `## Verification
New members first only see the welcome section and the verification channel. Click Verify and pick the right picture. After that you see the whole community.
## Invites
Invite your friends with your own invite link. Everyone who joins through your link and stays is counted. You can see your score in the client portal and on the community page.
## Giveaways
Join with one click on the button in the giveaways channel. Sometimes there's a requirement, like a role or a minimum number of invites.`,
    },
  },
];

export const getArticle = (slug: string) => articles.find((a) => a.slug === slug) ?? null;
