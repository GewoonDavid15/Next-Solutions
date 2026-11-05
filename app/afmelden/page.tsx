import type { Metadata } from "next";
import { CheckCircle2, MailX, XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Afmelden", robots: { index: false } };

/** Unsubscribe page from the link in every email. Works without logging in. */
export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<{ token?: string; gedaan?: string }> }) {
  const { token, gedaan } = await searchParams;
  const valid = token && /^[a-f0-9]{48}$/.test(token) ? token : null;

  return (
    <section className="flex min-h-[80svh] items-center justify-center px-4 pb-16 pt-32">
      <div className="glass w-full max-w-md rounded-3xl p-8 text-center sm:p-10">
        {gedaan === "1" ? (
          <>
            <CheckCircle2 className="mx-auto size-10 text-emerald-400" />
            <h1 className="mt-4 text-2xl font-semibold">Je bent afgemeld</h1>
            <p className="mt-2 text-sm text-zinc-400">Je krijgt geen e-mailmeldingen meer en je e-mailadres is verwijderd. Je kunt je altijd opnieuw aanmelden in het klantportaal.</p>
          </>
        ) : gedaan === "0" ? (
          <>
            <XCircle className="mx-auto size-10 text-rose-400" />
            <h1 className="mt-4 text-2xl font-semibold">Afmelden lukte niet</h1>
            <p className="mt-2 text-sm text-zinc-400">Misschien was je al afgemeld. Je kunt het ook regelen in je klantportaal.</p>
          </>
        ) : valid ? (
          <>
            <MailX className="mx-auto size-10 text-brand-300" />
            <h1 className="mt-4 text-2xl font-semibold">Afmelden voor e-mails</h1>
            <p className="mt-2 text-sm text-zinc-400">Wil je geen e-mailmeldingen van Next Solutions meer ontvangen?</p>
            <form action="/api/email/afmelden" method="post" className="mt-6">
              <input type="hidden" name="token" value={valid} />
              <Button type="submit" className="w-full">Ja, afmelden</Button>
            </form>
          </>
        ) : (
          <>
            <XCircle className="mx-auto size-10 text-rose-400" />
            <h1 className="mt-4 text-2xl font-semibold">Ongeldige link</h1>
            <p className="mt-2 text-sm text-zinc-400">Gebruik de link uit de mail, of zet meldingen uit in je klantportaal.</p>
          </>
        )}
        <Button asChild variant="secondary" className="mt-4 w-full">
          <Link href="/klantportaal">Naar het klantportaal</Link>
        </Button>
      </div>
    </section>
  );
}
