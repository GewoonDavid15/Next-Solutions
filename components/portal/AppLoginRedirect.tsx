"use client";

import { Smartphone } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

const PACKAGE = "nl.nextsolutionshq.app";

export function AppLoginRedirect({ code, error }: { code: string | null; error: string | null }) {
  const query = code ? `code=${encodeURIComponent(code)}` : `error=${encodeURIComponent(error ?? "unknown")}`;
  const intent = `intent://login?${query}#Intent;scheme=nlnextsolutions;package=${PACKAGE};end`;

  useEffect(() => {
    if (/Android/i.test(navigator.userAgent)) location.href = intent;
  }, [intent]);

  return (
    <section className="container flex min-h-[80svh] flex-col items-center justify-center pt-24 text-center">
      <span className="grid size-16 place-items-center rounded-2xl bg-brand-600/15 text-brand-300"><Smartphone className="size-8" /></span>
      <h1 className="mt-6 text-3xl font-semibold">{code ? "Bijna klaar!" : "Inloggen is niet gelukt"}</h1>
      <p className="mt-2 max-w-md text-zinc-400">
        {code ? "Tik op de knop om terug te gaan naar de app. Je bent dan ingelogd." : "Ga terug naar de app en probeer het opnieuw."}
      </p>
      <Button asChild className="mt-8"><a href={intent}>Open de Next Solutions-app</a></Button>
    </section>
  );
}
