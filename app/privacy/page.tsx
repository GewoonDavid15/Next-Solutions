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
    ],
  },
  {
    heading: "Waarvoor we ze gebruiken",
    list: [
      "Het opstellen en versturen van een offerte naar aanleiding van je aanvraag.",
      "Het uitvoeren van de opdracht en communiceren over de voortgang.",
      "Het tonen van jouw projecten, tickets, transcripts, bestanden en sollicitaties in het klantportaal nadat je bent ingelogd.",
      "Het versturen van meldingen via Discord, en per e-mail als je daarvoor hebt gekozen.",
      "Het beoordelen van sollicitaties en het verbeteren van onze service op basis van reviews.",
      "Het voldoen aan onze administratieve en fiscale verplichtingen.",
    ],
  },
  {
    heading: "Wat we niet doen",
    paragraphs: [
      "We verkopen je gegevens niet en verhuren ze niet aan derden. We gebruiken geen trackingcookies en geen advertentienetwerken. De website plaatst alleen een functionele cookie wanneer je inlogt op het klantportaal; die bewaart je sessie en verdwijnt wanneer je uitlogt of na zeven dagen.",
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
    heading: "Hoe lang we ze bewaren",
    paragraphs: [
      "Offerteaanvragen die niet tot een opdracht leiden, verwijderen we na twaalf maanden. Gegevens van klanten bewaren we tot zeven jaar na de laatste factuur, omdat de Belastingdienst dat van ons verlangt. Je sessie in het klantportaal vervalt automatisch na zeven dagen.",
      "Van tickets bewaren we de laatste duizend transcripts; oudere worden automatisch verwijderd. Je e-mailadres verwijderen we zodra je je afmeldt. Bestanden, reviews en sollicitaties verwijderen we op je verzoek.",
    ],
  },
  {
    heading: "Je rechten",
    paragraphs: [
      `Je mag altijd opvragen welke gegevens we van je hebben, ze laten corrigeren of laten verwijderen. Stuur daarvoor een bericht naar ${site.email} en we reageren binnen dertig dagen. Ben je het niet eens met hoe we met je gegevens omgaan, dan kun je een klacht indienen bij de Autoriteit Persoonsgegevens.`,
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
    ],
  },
  {
    heading: "What we use it for",
    list: [
      "Drawing up and sending a quote in response to your request.",
      "Carrying out the assignment and communicating about its progress.",
      "Showing your projects, tickets, transcripts, files and applications in the client portal after you log in.",
      "Sending notifications through Discord, and by email if you chose that.",
      "Assessing applications and improving our service based on reviews.",
      "Meeting our administrative and tax obligations.",
    ],
  },
  {
    heading: "What we don't do",
    paragraphs: [
      "We don't sell your data and don't rent it out to third parties. We don't use tracking cookies or advertising networks. The website only sets a functional cookie when you log in to the client portal; it keeps your session and disappears when you log out or after seven days. Choosing a language does not set a cookie: the language is part of the address (/en).",
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
    heading: "How long we keep it",
    paragraphs: [
      "Quote requests that don't lead to an assignment are deleted after twelve months. Client data is kept for up to seven years after the last invoice, because the Dutch Tax Administration requires this of us. Your client portal session expires automatically after seven days.",
      "We keep the last thousand ticket transcripts; older ones are deleted automatically. We delete your email address as soon as you unsubscribe. Files, reviews and applications are deleted at your request.",
    ],
  },
  {
    heading: "Your rights",
    paragraphs: [
      `You can always ask which data we hold about you, and have it corrected or deleted. Send a message to ${site.email} and we will reply within thirty days. If you disagree with how we handle your data, you can file a complaint with the Dutch Data Protection Authority (Autoriteit Persoonsgegevens).`,
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
        updated="5 November 2026"
        sections={sectionsEn}
      />
    );
  }
  return (
    <LegalPage
      eyebrow="Privacy"
      title={<>Privacy<span className="text-gradient">verklaring</span></>}
      description="Wat we met je gegevens doen, in gewone taal."
      updated="5 november 2026"
      sections={sections}
    />
  );
}
