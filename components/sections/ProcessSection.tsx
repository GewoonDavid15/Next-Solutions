import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getI18n } from "@/lib/i18n/server";

export async function ProcessSection() {
  const { locale, content } = await getI18n();
  const en = locale === "en";
  return (
    <section className="section">
      <div className="container">
        <SectionHeading
          eyebrow={en ? "How we work" : "Werkwijze"}
          title={en ? "From idea to launch" : "Van idee naar lancering"}
          description={en ? "A transparent process. You always know where your project stands." : "Een transparant proces. Je weet altijd waar je project staat."}
        />
        <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {content.process.map((p) => (
            <StaggerItem key={p.step}>
              <Card className="h-full">
                <span className="font-display text-5xl font-bold text-gradient">{p.step}</span>
                <h3 className="mt-4 text-xl font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{p.text}</p>
              </Card>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
