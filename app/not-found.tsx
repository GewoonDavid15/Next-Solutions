import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="container flex min-h-[80svh] flex-col items-center justify-center pt-24 text-center">
      <p className="font-display text-8xl font-bold text-gradient sm:text-9xl">404</p>
      <h1 className="mt-4 text-3xl font-semibold">Deze pagina bestaat niet</h1>
      <p className="mt-2 text-zinc-400">Misschien is hij verhuisd, of nooit gebouwd. Nog niet.</p>
      <Button asChild className="mt-8"><Link href="/">Terug naar home</Link></Button>
    </section>
  );
}
