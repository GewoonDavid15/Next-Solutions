import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { getI18n } from "@/lib/i18n/server";

export default async function NotFound() {
  const { locale, lp } = await getI18n();
  const en = locale === "en";
  return (
    <section className="container flex min-h-[80svh] flex-col items-center justify-center pt-24 text-center">
      <p className="font-display text-8xl font-bold text-gradient sm:text-9xl">404</p>
      <h1 className="mt-4 text-3xl font-semibold">{en ? "This page doesn't exist" : "Deze pagina bestaat niet"}</h1>
      <p className="mt-2 text-zinc-400">{en ? "Maybe it moved, or it was never built. Not yet." : "Misschien is hij verhuisd, of nooit gebouwd. Nog niet."}</p>
      <Button asChild className="mt-8"><Link href={lp("/")}>{en ? "Back to home" : "Terug naar home"}</Link></Button>
    </section>
  );
}
