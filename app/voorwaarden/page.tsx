import { LegalPage, type LegalSection } from "@/components/ui/LegalPage";
import { getI18n, pageMetadata } from "@/lib/i18n/server";
import { site } from "@/lib/site";

export async function generateMetadata() {
  const { locale } = await getI18n();
  return locale === "en"
    ? pageMetadata("/voorwaarden", "Terms and conditions", "The terms under which Next Solutions accepts and carries out assignments.")
    : pageMetadata("/voorwaarden", "Algemene voorwaarden", "De voorwaarden waaronder Next Solutions opdrachten aanneemt en uitvoert.");
}

const sections: LegalSection[] = [
  {
    heading: "1. Wie we zijn",
    paragraphs: [
      `Next Solutions is een online onderneming, opgericht en gerund door Nexify. We hebben geen fysiek kantoor of bezoekadres: al het contact loopt via onze Discord en via ${site.email}. Next Solutions staat (nog) niet ingeschreven bij de Kamer van Koophandel.`,
    ],
  },
  {
    heading: "2. Toepasselijkheid",
    paragraphs: [
      "Deze voorwaarden gelden voor elke offerte en elke opdracht van Next Solutions, tenzij we schriftelijk of in Discord iets anders hebben afgesproken. Wijken jouw eigen voorwaarden hiervan af, dan gelden die alleen als wij ze uitdrukkelijk hebben aanvaard.",
    ],
  },
  {
    heading: "3. Offertes en totstandkoming",
    paragraphs: [
      "Prijzen zijn op aanvraag. Je krijgt per project een offerte met een vaste prijs en een planning. Een offerte is dertig dagen geldig en vrijblijvend. Een opdracht komt tot stand zodra je de offerte schriftelijk of in Discord bevestigt.",
    ],
  },
  {
    heading: "4. Uitvoering",
    paragraphs: [
      "We voeren de opdracht uit naar beste inzicht en vermogen. Genoemde opleverdata zijn een inschatting en geen harde deadline, tenzij we dat uitdrukkelijk zo hebben afgesproken. Loopt het uit doordat we wachten op content, feedback of toegang van jouw kant, dan schuift de planning mee op.",
    ],
  },
  {
    heading: "5. Meerwerk",
    paragraphs: [
      "Vraag je tijdens het project om iets dat niet in de offerte stond, dan bespreken we eerst wat dat kost. We beginnen pas aan meerwerk nadat je daarmee akkoord bent.",
    ],
  },
  {
    heading: "6. Betaling",
    paragraphs: [
      "Je betaalt de volledige prijs uit de offerte in één keer, via Discord en op het moment dat in de offerte staat. Er is geen aanbetaling en er zijn geen deelbetalingen. Bij een abonnement, zoals hosting of onderhoud, betaal je per periode vooraf. Is er niet betaald, dan mogen we het werk opschorten of niet opleveren.",
    ],
  },
  {
    heading: "7. Oplevering en nazorg",
    paragraphs: [
      "Na oplevering heb je veertien dagen om het werk te controleren. Binnen dertig dagen na oplevering herstellen we fouten in het geleverde werk kosteloos; bij sommige pakketten is die termijn langer, zoals in de offerte staat. Nieuwe wensen, uitbreidingen en problemen door aanpassingen van anderen vallen daarbuiten.",
    ],
  },
  {
    heading: "8. Intellectueel eigendom",
    paragraphs: [
      "Zodra je hebt betaald, gaan de rechten op de voor jou gemaakte code en ontwerpen over op jou. Onderdelen uit onze eigen bibliotheek en software van anderen blijven eigendom van de maker; daarvoor krijg je een gebruiksrecht. We mogen het werk tonen in ons portfolio, tenzij we anders afspreken.",
    ],
  },
  {
    heading: "9. Hosting en beschikbaarheid",
    paragraphs: [
      "Bij hosting doen we ons best om je server of bot zo goed mogelijk online te houden en storingen snel op te lossen. De actuele status van onze diensten staat op de statuspagina. We garanderen geen vaste beschikbaarheid en zijn niet aansprakelijk voor storingen bij leveranciers, DDoS-aanvallen of uitval van platformen van anderen, zoals Discord.",
    ],
  },
  {
    heading: "10. Aansprakelijkheid",
    paragraphs: [
      "Onze aansprakelijkheid is beperkt tot het bedrag dat je voor de betreffende opdracht hebt betaald. We zijn niet aansprakelijk voor gevolgschade, gederfde winst of verlies van gegevens. Deze beperking geldt niet bij opzet of bewuste roekeloosheid van onze kant.",
    ],
  },
  {
    heading: "11. Opzegging",
    paragraphs: [
      "Abonnementen kun je per maand opzeggen; ze lopen dan door tot het einde van de betaalde periode. Stop je een lopende opdracht tussentijds, dan rekenen we het werk af dat tot dat moment is gedaan.",
    ],
  },
  {
    heading: "12. Toepasselijk recht",
    paragraphs: [
      "Op onze afspraken is Nederlands recht van toepassing. Komen we er samen niet uit, dan leggen we het geschil voor aan de bevoegde Nederlandse rechter.",
    ],
  },
];


const sectionsEn: LegalSection[] = [
  { heading: "1. Who we are", paragraphs: [`Next Solutions is an online business, founded and run by Nexify. We have no physical office or visiting address: all contact runs through our Discord and through ${site.email}. Next Solutions is not (yet) registered with the Dutch Chamber of Commerce (KvK).`] },
  { heading: "2. Applicability", paragraphs: ["These terms apply to every quote and every assignment of Next Solutions, unless we have agreed otherwise in writing or in Discord. If your own terms differ from these, they only apply if we have explicitly accepted them."] },
  { heading: "3. Quotes and agreement", paragraphs: ["Prices are on request. For every project you get a quote with a fixed price and a schedule. A quote is valid for thirty days and is without obligation. An assignment is agreed as soon as you confirm the quote in writing or in Discord."] },
  { heading: "4. Execution", paragraphs: ["We carry out the assignment to the best of our knowledge and ability. Delivery dates are an estimate and not a hard deadline, unless we have explicitly agreed so. If things run late because we are waiting for content, feedback or access from your side, the schedule moves along with it."] },
  { heading: "5. Additional work", paragraphs: ["If during the project you ask for something that was not in the quote, we first discuss what it costs. We only start on additional work after you have agreed to it."] },
  { heading: "6. Payment", paragraphs: ["You pay the full price from the quote in one go, through Discord and at the moment stated in the quote. There is no deposit and there are no instalments. For a subscription, such as hosting or maintenance, you pay per period in advance. If payment has not been made, we may suspend the work or not deliver it."] },
  { heading: "7. Delivery and aftercare", paragraphs: ["After delivery you have fourteen days to check the work. Within thirty days of delivery we fix errors in the delivered work free of charge; for some packages this period is longer, as stated in the quote. New wishes, extensions and problems caused by changes made by others are not included."] },
  { heading: "8. Intellectual property", paragraphs: ["Once you have paid, the rights to the code and designs made for you transfer to you. Parts from our own library and software by others remain the property of their maker; you receive a licence to use them. We may show the work in our portfolio, unless we agree otherwise."] },
  { heading: "9. Hosting and availability", paragraphs: ["With hosting we do our best to keep your server or bot online as well as possible and to fix outages quickly. The current status of our services is on the status page. We do not guarantee a fixed availability and are not liable for outages at suppliers, DDoS attacks or downtime of platforms run by others, such as Discord."] },
  { heading: "10. Liability", paragraphs: ["Our liability is limited to the amount you paid for the assignment concerned. We are not liable for consequential damage, lost profit or loss of data. This limitation does not apply in the case of intent or deliberate recklessness on our part."] },
  { heading: "11. Termination", paragraphs: ["Subscriptions can be cancelled per month; they then run until the end of the paid period. If you stop an ongoing assignment early, we charge for the work done up to that moment."] },
  { heading: "12. Applicable law", paragraphs: ["Dutch law applies to our agreements. If we cannot resolve a dispute together, we submit it to the competent Dutch court."] },
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
        updated="5 November 2026"
        sections={sectionsEn}
      />
    );
  }
  return (
    <LegalPage
      eyebrow="Voorwaarden"
      title={<>Algemene <span className="text-gradient">voorwaarden</span></>}
      description="De afspraken waaronder we werken, zonder onnodig juridisch jargon."
      updated="5 november 2026"
      sections={sections}
    />
  );
}
