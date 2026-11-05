import { LegalPage, type LegalSection } from "@/components/ui/LegalPage";
import { getI18n, pageMetadata } from "@/lib/i18n/server";

export async function generateMetadata() {
  const { locale } = await getI18n();
  return locale === "en"
    ? pageMetadata("/voorwaarden", "Terms and conditions", "The terms under which Next Solutions accepts and carries out assignments.")
    : pageMetadata("/voorwaarden", "Algemene voorwaarden", "De voorwaarden waaronder Next Solutions opdrachten aanneemt en uitvoert.");
}

const sections: LegalSection[] = [
  {
    heading: "1. Toepasselijkheid",
    paragraphs: [
      "Deze voorwaarden gelden voor elke offerte en elke opdracht van Next Solutions, tenzij we schriftelijk iets anders hebben afgesproken. Wijken jouw inkoopvoorwaarden hiervan af, dan gelden die alleen als wij ze uitdrukkelijk hebben aanvaard.",
    ],
  },
  {
    heading: "2. Offertes en totstandkoming",
    paragraphs: [
      "Offertes zijn dertig dagen geldig en vrijblijvend. Een opdracht komt tot stand zodra je de offerte schriftelijk of via Discord bevestigt. Prijzen zijn exclusief btw, tenzij anders vermeld.",
    ],
  },
  {
    heading: "3. Uitvoering",
    paragraphs: [
      "We voeren de opdracht uit naar beste inzicht en vermogen. Genoemde opleverdata zijn een inschatting en geen fatale termijn, tenzij we dat uitdrukkelijk zo hebben vastgelegd. Loopt het uit doordat we wachten op content, feedback of toegang van jouw kant, dan schuift de planning mee op.",
    ],
  },
  {
    heading: "4. Meerwerk",
    paragraphs: [
      "Vraag je tijdens het project om functionaliteit die niet in de offerte stond, dan bespreken we eerst wat dat kost en oplevert. We beginnen pas aan meerwerk nadat je daarmee akkoord bent.",
    ],
  },
  {
    heading: "5. Betaling",
    paragraphs: [
      "Bij projecten vanaf duizend euro vragen we vooraf vijftig procent aanbetaling; de rest volgt bij oplevering. Facturen hebben een betaaltermijn van veertien dagen. Bij abonnementen, zoals hosting en onderhoud, factureren we vooraf per maand.",
    ],
  },
  {
    heading: "6. Oplevering en nazorg",
    paragraphs: [
      "Na oplevering heb je veertien dagen om het werk te controleren. Binnen dertig dagen na oplevering herstellen we gebreken in het geleverde werk kosteloos. Wijzigingen in je wensen, uitbreidingen en problemen door aanpassingen van derden vallen daarbuiten.",
    ],
  },
  {
    heading: "7. Intellectueel eigendom",
    paragraphs: [
      "Zodra je alles hebt betaald, gaan de rechten op de voor jou gemaakte code en ontwerpen over op jou. Onderdelen uit onze eigen bibliotheek en software van derden blijven eigendom van de maker; daarvoor krijg je een gebruiksrecht. We mogen het werk tonen in ons portfolio, tenzij we schriftelijk anders afspreken.",
    ],
  },
  {
    heading: "8. Hosting en beschikbaarheid",
    paragraphs: [
      "Bij een hostingabonnement streven we naar een beschikbaarheid van 99,9 procent per maand, gemeten buiten aangekondigd onderhoud om. We zijn niet aansprakelijk voor storingen bij toeleveranciers, DDoS-aanvallen of uitval van platformen van derden, zoals Discord.",
    ],
  },
  {
    heading: "9. Aansprakelijkheid",
    paragraphs: [
      "Onze aansprakelijkheid is beperkt tot het bedrag dat voor de betreffende opdracht is gefactureerd. We zijn niet aansprakelijk voor gevolgschade, gederfde winst of verlies van gegevens. Deze beperking geldt niet bij opzet of bewuste roekeloosheid van onze kant.",
    ],
  },
  {
    heading: "10. Opzegging",
    paragraphs: [
      "Abonnementen kun je maandelijks opzeggen met een opzegtermijn van één maand. Beëindig je een lopende opdracht tussentijds, dan factureren we het werk dat tot dat moment is verricht.",
    ],
  },
  {
    heading: "11. Toepasselijk recht",
    paragraphs: [
      "Op onze overeenkomsten is Nederlands recht van toepassing. Komen we er samen niet uit, dan leggen we het geschil voor aan de bevoegde rechter in het arrondissement waar Next Solutions is gevestigd.",
    ],
  },
];


const sectionsEn: LegalSection[] = [
  { heading: "1. Applicability", paragraphs: ["These terms apply to every quote and every assignment of Next Solutions, unless we have agreed otherwise in writing. If your purchasing terms differ from these, they only apply if we have explicitly accepted them."] },
  { heading: "2. Quotes and agreement", paragraphs: ["Quotes are valid for thirty days and are without obligation. An assignment is agreed as soon as you confirm the quote in writing or through Discord. Prices exclude VAT, unless stated otherwise."] },
  { heading: "3. Execution", paragraphs: ["We carry out the assignment to the best of our knowledge and ability. Delivery dates are an estimate and not a strict deadline, unless we have explicitly recorded it as such. If things run late because we are waiting for content, feedback or access from your side, the schedule moves along with it."] },
  { heading: "4. Additional work", paragraphs: ["If during the project you ask for functionality that was not in the quote, we first discuss what it costs and what it delivers. We only start on additional work after you have agreed to it."] },
  { heading: "5. Payment", paragraphs: ["For projects of one thousand euros or more we ask for a fifty per cent deposit up front; the rest follows on delivery. Invoices have a payment term of fourteen days. Subscriptions, such as hosting and maintenance, are invoiced monthly in advance."] },
  { heading: "6. Delivery and aftercare", paragraphs: ["After delivery you have fourteen days to check the work. Within thirty days of delivery we fix defects in the delivered work free of charge. Changes in your wishes, extensions and problems caused by changes made by third parties are not included."] },
  { heading: "7. Intellectual property", paragraphs: ["Once you have paid in full, the rights to the code and designs made for you transfer to you. Parts from our own library and third-party software remain the property of their maker; you receive a licence to use them. We may show the work in our portfolio, unless we agree otherwise in writing."] },
  { heading: "8. Hosting and availability", paragraphs: ["With a hosting subscription we aim for an availability of 99.9 per cent per month, measured outside announced maintenance. We are not liable for outages at suppliers, DDoS attacks or downtime of third-party platforms, such as Discord."] },
  { heading: "9. Liability", paragraphs: ["Our liability is limited to the amount invoiced for the assignment concerned. We are not liable for consequential damage, lost profit or loss of data. This limitation does not apply in the case of intent or deliberate recklessness on our part."] },
  { heading: "10. Termination", paragraphs: ["Subscriptions can be cancelled monthly with a notice period of one month. If you end an ongoing assignment early, we invoice the work done up to that moment."] },
  { heading: "11. Applicable law", paragraphs: ["Dutch law applies to our agreements. If we cannot resolve a dispute together, we submit it to the competent court in the district where Next Solutions is established."] },
];

export default async function VoorwaardenPage() {
  const { locale } = await getI18n();
  if (locale === "en") {
    return (
      <LegalPage
        locale="en"
        eyebrow="Terms"
        title={<>Terms and <span className="text-gradient">conditions</span></>}
        description="The agreements we work under, without unnecessary legal jargon."
        updated="4 November 2026"
        sections={sectionsEn}
      />
    );
  }
  return (
    <LegalPage
      eyebrow="Voorwaarden"
      title={<>Algemene <span className="text-gradient">voorwaarden</span></>}
      description="De afspraken waaronder we werken, zonder onnodig juridisch jargon."
      updated="4 november 2026"
      sections={sections}
    />
  );
}
