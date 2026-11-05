import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/ui/LegalPage";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacyverklaring",
  description: "Welke gegevens Next Solutions verwerkt, waarom, en welke rechten je daarbij hebt.",
};

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

export default function PrivacyPage() {
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
