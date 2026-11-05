"use client";

import { RotateCcw } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/components/i18n/I18nProvider";
import { Button } from "@/components/ui/Button";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { locale, lp } = useI18n();
  const en = locale === "en";
  return (
    <section className="container flex min-h-[80svh] flex-col items-center justify-center pt-24 text-center">
      <p className="font-display text-7xl font-bold text-gradient sm:text-8xl">{en ? "Oops" : "Oeps"}</p>
      <h1 className="mt-4 text-3xl font-semibold">{en ? "Something went wrong" : "Er ging iets mis"}</h1>
      <p className="mt-2 max-w-md text-zinc-400">
        {en
          ? "This page could not be loaded. Please try again, or get in touch if it keeps happening."
          : "Deze pagina kon niet geladen worden. Probeer het opnieuw, of neem contact op als het blijft gebeuren."}
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button onClick={reset}>
          <RotateCcw /> {en ? "Try again" : "Probeer opnieuw"}
        </Button>
        <Button asChild variant="secondary">
          <Link href={lp("/contact")}>{en ? "Get in touch" : "Contact opnemen"}</Link>
        </Button>
      </div>
    </section>
  );
}
