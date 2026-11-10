import Image from "next/image";
import { klantLogos } from "@/lib/klant-logos";

/** "Trusted by": client logos (with permission). Hidden while the list in lib/klant-logos.ts is empty. */
export function TrustedBy({ locale }: { locale: "nl" | "en" }) {
  if (!klantLogos.length) return null;
  return (
    <section className="container py-10" aria-label={locale === "en" ? "Trusted by" : "Vertrouwd door"}>
      <p className="text-center text-xs font-semibold uppercase tracking-widest text-zinc-500">{locale === "en" ? "Trusted by" : "Vertrouwd door"}</p>
      <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
        {klantLogos.map((k) => (
          <li key={k.naam} className="opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0">
            {k.url
              ? <a href={k.url} target="_blank" rel="noopener noreferrer"><Image src={k.logo} alt={k.naam} width={140} height={48} className="h-10 w-auto object-contain" /></a>
              : <Image src={k.logo} alt={k.naam} width={140} height={48} className="h-10 w-auto object-contain" />}
          </li>
        ))}
      </ul>
    </section>
  );
}
