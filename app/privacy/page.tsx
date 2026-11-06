import { LegalPage, type LegalSection } from "@/components/ui/LegalPage";
import { getI18n, pageMetadata } from "@/lib/i18n/server";
import { site } from "@/lib/site";

export async function generateMetadata() {
  const { locale } = await getI18n();
  return locale === "en"
    ? pageMetadata("/privacy", "Privacy policy", "What data Next Solutions processes, why, and what rights you have.")
    : pageMetadata("/privacy", "Privacyverklaring", "Welke gegevens Next Solutions verwerkt, waarom, en welke rechten je daarbij hebt.");
}

const sections: LegalSection[] = [
  {
    heading: "Wie we zijn",
    paragraphs: [
      `Next Solutions is een online onderneming van Nexify, zonder fysiek kantoor en (nog) niet ingeschreven bij de Kamer van Koophandel. Wij zijn verantwoordelijk voor de gegevens in deze verklaring. Vragen over je gegevens stel je via ${site.email} of een ticket in onze Discord.`,
    ],
  },
  {
    heading: "Welke gegevens we verwerken",
    paragraphs: [
      "We verwerken alleen gegevens die je zelf aan ons geeft of die nodig zijn om de website te laten werken.",
    ],
    list: [
      "Offerteformulier: je naam, e-mailadres, optioneel je Discord-gebruikersnaam, en de omschrijving van je project.",
      "Klantportaal: je Discord-gebruikersnaam, gebruikers-ID en profielfoto, opgehaald via Discord OAuth2 met de scope 'identify'.",
      "Projectgegevens: de status van je lopende opdrachten en tickets, zolang je klant bij ons bent.",
      "Tickets in onze Discord: de berichten en bijlagen in je ticket. Bij het sluiten bewaren we een transcript, dat jij en ons team kunnen teruglezen.",
      "Bestanden: bestanden die we voor je klaarzetten in het klantportaal, zoals ontwerpen of scripts.",
      "Reviews: je sterren, je toelichting en je Discord-naam. Reviews met vier of vijf sterren kunnen op onze website verschijnen.",
      "Sollicitaties: je Discord-gebruikersnaam en je antwoorden op de vragen bij de vacature.",
      "E-mailmeldingen: alleen als je die zelf aanzet en bevestigt, je e-mailadres en welke meldingen je wilt ontvangen.",
      "Invites in onze Discord: via welke invite-link je bent binnengekomen, wie die link maakte, en wanneer je joinde of vertrok. Op de website tonen we alleen de naam en het aantal invites van de beste uitnodigers.",
      "Offertes: wat we je aanbieden, de prijs, of je akkoord gaf en of je hebt betaald. Je ziet je offertes ook in het klantportaal.",
      "Giveaways: dat je meedoet aan een giveaway en of je hebt gewonnen.",
      "Verificatie: dat en wanneer je de captcha in onze Discord hebt gehaald. Het antwoord dat je kiest, bewaren we niet.",
      "Profiel: wat je zelf invult (bio, korte tekst, bedrijf, website, socials, profielkleur) en je profielnaam. Daarnaast tonen we je Discord-naam, avatar, banner, avatar-decoratie, naamplaatje, servertag en rollen, en of je Nitro hebt (dat zien we alleen bij het inloggen). Je profiel is alleen openbaar als je dat zelf aanzet.",
      "Badges, niveau en activiteit: berekend uit je projecten, offertes, reviews en invites, en het aantal berichten en minuten in voice in onze Discord (voor het levelsysteem). De inhoud van je berichten slaan we daarvoor niet op.",
      "Meldingen in het klantportaal: korte meldingen over je tickets, projecten, offertes, bestanden en afspraken.",
      "Afspraken: het tijdstip, het onderwerp en je toelichting als je een call met ons plant.",
      "Social media: de contentkalender, je goedkeuringen en feedback, maandrapporten met de cijfers van je accounts, je abonnement en betalingen, en bestanden of links die je aanlevert. Aangeleverde bestanden staan in een afgeschermd kanaal in onze Discord dat alleen ons team kan zien.",
      "Suggesties in onze Discord: je idee, je naam en wie erop stemde.",
      "Moderatie: waarschuwingen, time-outs en wat onze automatische moderatie tegenhield (inclusief het betreffende bericht), om de community veilig te houden.",
      "Websitebezoek: geanonimiseerde tellingen per dag (zoals het aantal bezoeken aan een pagina en het aantal aanvragen), zonder cookies en zonder je IP-adres of andere gegevens die naar jou te herleiden zijn.",
    ],
  },
  {
    heading: "Waarvoor we ze gebruiken",
    list: [
      "Het opstellen en versturen van een offerte naar aanleiding van je aanvraag.",
      "Het uitvoeren van de opdracht en communiceren over de voortgang.",
      "Het tonen van jouw projecten, tickets, transcripts, bestanden, sollicitaties, offertes, afspraken en social media-gegevens in het klantportaal nadat je bent ingelogd.",
      "Het beheren van je social media, het opstellen van maandrapporten en het herinneren aan betalingen van je abonnement.",
      "Het tonen van je profiel, badges en niveau, en als je dat aanzet, je openbare profielpagina.",
      "Het veilig houden van onze Discord-community (verificatie, moderatie, bescherming tegen raids).",
      "Begrijpen welke pagina's goed werken, met geanonimiseerde tellingen zonder cookies.",
      "Het versturen van meldingen via Discord, en per e-mail als je daarvoor hebt gekozen.",
      "Het beoordelen van sollicitaties en het verbeteren van onze service op basis van reviews.",
      "Het voldoen aan onze administratieve en fiscale verplichtingen.",
    ],
  },
  {
    heading: "Wat we niet doen",
    paragraphs: [
      "We verkopen je gegevens niet en verhuren ze niet aan derden. We gebruiken geen trackingcookies en geen advertentienetwerken, en daarom ook geen cookiebanner. De website gebruikt alleen functionele cookies: tijdens het inloggen twee tijdelijke cookies ter beveiliging (maximaal tien minuten), en daarna een sessiecookie plus een cookie zonder inhoud die aangeeft dat je bent ingelogd. Die verdwijnen wanneer je uitlogt of na zeven dagen. Voor bezoekersstatistieken gebruiken we Vercel Web Analytics en een eigen telling; allebei zonder cookies en zonder gegevens die naar jou te herleiden zijn.",
    ],
  },
  {
    heading: "Discord",
    paragraphs: [
      "Log je in met Discord, dan ontvangen we alleen je publieke profiel. We krijgen geen toegang tot je privéberichten, je e-mailadres bij Discord of de servers waar je lid van bent. Wel leest onze bot de berichten in je ticket, zodat we een transcript kunnen maken. Op het gebruik van Discord zelf is de privacyverklaring van Discord van toepassing.",
    ],
  },
  {
    heading: "E-mail",
    paragraphs: [
      "E-mailmeldingen staan standaard uit. Zet je ze aan in het klantportaal, dan sturen we eerst een bevestigingsmail; pas daarna ontvang je meldingen. Elke mail bevat een afmeldlink. Afmelden verwijdert ook je e-mailadres. Voor het versturen gebruiken we Resend als verwerker; zij verwerken je e-mailadres alleen om de mail te bezorgen.",
    ],
  },
  {
    heading: "Wie je gegevens nog meer verwerken",
    list: [
      "Vercel (hosting van de website en geanonimiseerde bezoekersstatistieken).",
      "Craftnode (hosting van onze Discord-bot, waar de gegevens van het klantportaal staan).",
      "Discord (tickets, berichten, aangeleverde bestanden en meldingen via DM).",
      "Resend (alleen als je e-mailmeldingen aanzet).",
    ],
    paragraphs: ["Zij verwerken je gegevens alleen om hun dienst aan ons te leveren."],
  },
  {
    heading: "Hoe lang we ze bewaren",
    paragraphs: [
      "Offerteaanvragen die niet tot een opdracht leiden, verwijderen we na twaalf maanden. Gegevens van klanten bewaren we zolang je klant bent, en daarna alleen zo lang als de wet dat van ons vraagt, bijvoorbeeld voor de administratie van betalingen. Je sessie in het klantportaal vervalt automatisch na zeven dagen.",
      "Van tickets bewaren we de laatste duizend transcripts; oudere worden automatisch verwijderd. Je e-mailadres verwijderen we zodra je je afmeldt. Bestanden, reviews en sollicitaties verwijderen we op je verzoek.",
      "Afgelopen of geannuleerde afspraken verwijderen we na negentig dagen. Van meldingen bewaren we de laatste zestig per persoon. Waarschuwingspunten tellen dertig dagen mee; de waarschuwing zelf bewaren we zolang je lid bent van onze Discord. Je profiel, levels, social media-gegevens en aangeleverde bestanden bewaren we tot je vraagt om ze te verwijderen of je geen klant of lid meer bent. Gegevens over betalingen bewaren we zo lang als de wet vraagt.",
    ],
  },
  {
    heading: "Je rechten",
    paragraphs: [
      `Je mag altijd opvragen welke gegevens we van je hebben, ze laten corrigeren of laten verwijderen. In het klantportaal kun je onder Instellingen → Mijn gegevens zelf een kopie downloaden en een verwijderverzoek indienen. Je kunt ook een bericht sturen naar ${site.email}; we reageren binnen dertig dagen. Ben je het niet eens met hoe we met je gegevens omgaan, dan kun je een klacht indienen bij de Autoriteit Persoonsgegevens.`,
    ],
  },
  {
    heading: "Beveiliging",
    paragraphs: [
      "Verkeer naar deze website loopt via een versleutelde verbinding. Sessiecookies worden ondertekend en zijn niet uit te lezen door scripts in je browser. Toegang tot klantgegevens is beperkt tot de medewerkers die eraan werken.",
    ],
  },
];


const sectionsEn: LegalSection[] = [
  {
    heading: "Who we are",
    paragraphs: [
      `Next Solutions is an online business run by Nexify, without a physical office and not (yet) registered with the Dutch Chamber of Commerce (KvK). We are responsible for the data described in this policy. Questions about your data can be sent to ${site.email} or asked in a ticket in our Discord.`,
    ],
  },
  {
    heading: "What data we process",
    paragraphs: ["We only process data that you give us yourself or that is needed to make the website work."],
    list: [
      "Quote form: your name, email address, optionally your Discord username, and the description of your project.",
      "Client portal: your Discord username, user ID and profile picture, retrieved through Discord OAuth2 with the scope 'identify'.",
      "Project data: the status of your ongoing assignments and tickets, for as long as you are a client.",
      "Tickets in our Discord: the messages and attachments in your ticket. When it closes we keep a transcript that you and our team can read back.",
      "Files: files we prepare for you in the client portal, such as designs or scripts.",
      "Reviews: your stars, your comment and your Discord name. Reviews with four or five stars may appear on our website.",
      "Applications: your Discord username and your answers to the questions for the vacancy.",
      "Email notifications: only if you turn them on and confirm them yourself, your email address and which notifications you want to receive.",
      "Invites in our Discord: which invite link you joined through, who created that link, and when you joined or left. On the website we only show the name and number of invites of the top inviters.",
      "Quotes: what we offer you, the price, whether you approved it and whether you paid. You can also see your quotes in the client portal.",
      "Giveaways: that you entered a giveaway and whether you won.",
      "Verification: that and when you passed the captcha in our Discord. We don't store the answer you chose.",
      "Profile: what you fill in yourself (bio, short line, company, website, socials, profile colour) and your profile name. We also show your Discord name, avatar, banner, avatar decoration, nameplate, server tag and roles, and whether you have Nitro (we only see that when you log in). Your profile is only public if you turn that on yourself.",
      "Badges, level and activity: calculated from your projects, quotes, reviews and invites, and the number of messages and minutes in voice in our Discord (for the level system). We don't store the content of your messages for this.",
      "Notifications in the client portal: short notifications about your tickets, projects, quotes, files and appointments.",
      "Appointments: the time, topic and your note when you schedule a call with us.",
      "Social media: the content calendar, your approvals and feedback, monthly reports with your accounts' numbers, your subscription and payments, and files or links you deliver. Delivered files are kept in a restricted channel in our Discord that only our team can see.",
      "Suggestions in our Discord: your idea, your name and who voted on it.",
      "Moderation: warnings, time-outs and what our automatic moderation blocked (including the message itself), to keep the community safe.",
      "Website visits: anonymised daily counts (such as the number of visits to a page and the number of requests), without cookies and without your IP address or anything else that identifies you.",
    ],
  },
  {
    heading: "What we use it for",
    list: [
      "Drawing up and sending a quote in response to your request.",
      "Carrying out the assignment and communicating about its progress.",
      "Showing your projects, tickets, transcripts, files, applications, quotes, appointments and social media data in the client portal after you log in.",
      "Managing your social media, writing monthly reports and reminding you of subscription payments.",
      "Showing your profile, badges and level, and if you turn it on, your public profile page.",
      "Keeping our Discord community safe (verification, moderation, protection against raids).",
      "Understanding which pages work well, with anonymised counts without cookies.",
      "Sending notifications through Discord, and by email if you chose that.",
      "Assessing applications and improving our service based on reviews.",
      "Meeting our administrative and tax obligations.",
    ],
  },
  {
    heading: "What we don't do",
    paragraphs: [
      "We don't sell your data and don't rent it out to third parties. We don't use tracking cookies or advertising networks, so there is no cookie banner either. The website only uses functional cookies: two temporary security cookies while logging in (ten minutes at most), and after that a session cookie plus an empty cookie that tells the site you are logged in. They disappear when you log out or after seven days. For visitor statistics we use Vercel Web Analytics and our own count; both without cookies and without anything that identifies you. Choosing a language does not set a cookie: the language is part of the address (/en).",
    ],
  },
  {
    heading: "Discord",
    paragraphs: [
      "If you log in with Discord, we only receive your public profile. We get no access to your private messages, your Discord email address or the servers you are a member of. Our bot does read the messages in your ticket, so that we can make a transcript. Discord's own privacy policy applies to your use of Discord itself.",
    ],
  },
  {
    heading: "Email",
    paragraphs: [
      "Email notifications are off by default. If you turn them on in the client portal, we first send a confirmation email; only after that do you receive notifications. Every email contains an unsubscribe link. Unsubscribing also removes your email address. We use Resend as a processor for sending; they only process your email address to deliver the email.",
    ],
  },
  {
    heading: "Who else processes your data",
    list: [
      "Vercel (hosting of the website and anonymised visitor statistics).",
      "Craftnode (hosting of our Discord bot, where the client portal data is stored).",
      "Discord (tickets, messages, delivered files and notifications by DM).",
      "Resend (only if you turn on email notifications).",
    ],
    paragraphs: ["They only process your data to deliver their service to us."],
  },
  {
    heading: "How long we keep it",
    paragraphs: [
      "Quote requests that don't lead to an assignment are deleted after twelve months. Client data is kept for as long as you are a client, and after that only as long as the law requires, for example for the records of payments. Your client portal session expires automatically after seven days.",
      "We keep the last thousand ticket transcripts; older ones are deleted automatically. We delete your email address as soon as you unsubscribe. Files, reviews and applications are deleted at your request.",
      "Past or cancelled appointments are deleted after ninety days. We keep the last sixty notifications per person. Warning points count for thirty days; the warning itself is kept for as long as you are a member of our Discord. Your profile, levels, social media data and delivered files are kept until you ask us to delete them or you are no longer a client or member. Payment records are kept for as long as the law requires.",
    ],
  },
  {
    heading: "Your rights",
    paragraphs: [
      `You can always ask which data we hold about you, and have it corrected or deleted. In the client portal, under Settings → My data, you can download a copy yourself and submit a deletion request. You can also send a message to ${site.email}; we reply within thirty days. If you disagree with how we handle your data, you can file a complaint with the Dutch Data Protection Authority (Autoriteit Persoonsgegevens).`,
    ],
  },
  {
    heading: "Security",
    paragraphs: [
      "Traffic to this website runs over an encrypted connection. Session cookies are signed and cannot be read by scripts in your browser. Access to client data is limited to the team members working on it.",
    ],
  },
];

export default async function PrivacyPage() {
  const { locale } = await getI18n();
  if (locale === "en") {
    return (
      <LegalPage
        locale="en"
        eyebrow="Privacy"
        title={<>Privacy <span className="text-gradient">policy</span></>}
        description="What we do with your data, in plain language."
        updated="6 November 2026"
        sections={sectionsEn}
      />
    );
  }
  return (
    <LegalPage
      eyebrow="Privacy"
      title={<>Privacy<span className="text-gradient">verklaring</span></>}
      description="Wat we met je gegevens doen, in gewone taal."
      updated="6 november 2026"
      sections={sections}
    />
  );
}
