import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/ui/LegalPage";

export const metadata: Metadata = {
  title: "Algemene voorwaarden",
  description: "De voorwaarden waaronder Next Solutions opdrachten aanneemt en uitvoert.",
};

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

export default function VoorwaardenPage() {
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
