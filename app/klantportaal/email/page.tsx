import type { Metadata } from "next";
import { CheckCircle2, Mail, XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "E-mailadres bevestigen", robots: { index: false } };

/** Landing page of the confirmation link. Confirming happens only after clicking the button. */
export default async function ConfirmEmailPage({ searchParams }: { searchParams: Promise<{ bevestig?: string; resultaat?: string; melding?: string }> }) {
  const { bevestig, resultaat, melding } = await searchParams;
  const token = bevestig && /^[a-f0-9]{48}$/.test(bevestig) ? bevestig : null;

  return (
    <section className="flex min-h-[80svh] items-center justify-center px-4 pb-16 pt-32">
      <div className="glass w-full max-w-md rounded-3xl p-8 text-center sm:p-10">
        {resultaat === "ok" ? (
          <>
            <CheckCircle2 className="mx-auto size-10 text-emerald-400" />
            <h1 className="mt-4 text-2xl font-semibold">E-mailadres bevestigd</h1>
            <p className="mt-2 text-sm text-zinc-400">Vanaf nu krijg je meldingen per e-mail. In je klantportaal kies je welke.</p>
          </>
        ) : resultaat === "fout" ? (
          <>
            <XCircle className="mx-auto size-10 text-rose-400" />
            <h1 className="mt-4 text-2xl font-semibold">Dat lukte niet</h1>
            <p className="mt-2 text-sm text-zinc-400">{melding ?? "Probeer het opnieuw via je klantportaal."}</p>
          </>
        ) : token ? (
          <>
            <Mail className="mx-auto size-10 text-brand-300" />
            <h1 className="mt-4 text-2xl font-semibold">Bevestig je e-mailadres</h1>
            <p className="mt-2 text-sm text-zinc-400">Klik op de knop om e-mailmeldingen van Next Solutions aan te zetten.</p>
            <form action="/api/email/bevestig" method="post" className="mt-6">
              <input type="hidden" name="token" value={token} />
              <Button type="submit" className="w-full">E-mailadres bevestigen</Button>
            </form>
          </>
        ) : (
          <>
            <XCircle className="mx-auto size-10 text-rose-400" />
            <h1 className="mt-4 text-2xl font-semibold">Ongeldige link</h1>
            <p className="mt-2 text-sm text-zinc-400">Vraag in je klantportaal een nieuwe bevestigingsmail aan.</p>
          </>
        )}
        <Button asChild variant="secondary" className="mt-4 w-full">
          <Link href="/klantportaal">Naar het klantportaal</Link>
        </Button>
      </div>
    </section>
  );
}
