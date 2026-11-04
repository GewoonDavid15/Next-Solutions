import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { process } from "@/lib/data";

export function ProcessSection() {
  return (
    <section className="section">
      <div className="container">
        <SectionHeading eyebrow="Werkwijze" title="Van idee naar lancering" description="Een transparant proces. Je weet altijd waar je project staat." />
        <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {process.map((p) => (
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
