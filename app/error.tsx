"use client";

import { RotateCcw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="container flex min-h-[80svh] flex-col items-center justify-center pt-24 text-center">
      <p className="font-display text-7xl font-bold text-gradient sm:text-8xl">Oeps</p>
      <h1 className="mt-4 text-3xl font-semibold">Er ging iets mis</h1>
      <p className="mt-2 max-w-md text-zinc-400">
        Deze pagina kon niet geladen worden. Probeer het opnieuw, of neem contact op als het blijft gebeuren.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button onClick={reset}>
          <RotateCcw /> Probeer opnieuw
        </Button>
        <Button asChild variant="secondary">
          <Link href="/contact">Contact opnemen</Link>
        </Button>
      </div>
    </section>
  );
}
