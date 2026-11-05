import { CheckCircle2, Mail, XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata() {
  const { locale } = await getI18n();
  return { title: locale === "en" ? "Confirm email address" : "E-mailadres bevestigen", robots: { index: false } };
}

const texts = {
  nl: {
    okTitle: "E-mailadres bevestigd", okText: "Vanaf nu krijg je meldingen per e-mail. In je klantportaal kies je welke.",
    failTitle: "Dat lukte niet", failText: "Probeer het opnieuw via je klantportaal.",
    confirmTitle: "Bevestig je e-mailadres", confirmText: "Klik op de knop om e-mailmeldingen van Next Solutions aan te zetten.", confirm: "E-mailadres bevestigen",
    invalidTitle: "Ongeldige link", invalidText: "Vraag in je klantportaal een nieuwe bevestigingsmail aan.", portal: "Naar het klantportaal",
  },
  en: {
    okTitle: "Email address confirmed", okText: "From now on you'll receive notifications by email. Choose which ones in your client portal.",
    failTitle: "That didn't work", failText: "Please try again through your client portal.",
    confirmTitle: "Confirm your email address", confirmText: "Click the button to turn on email notifications from Next Solutions.", confirm: "Confirm email address",
    invalidTitle: "Invalid link", invalidText: "Request a new confirmation email in your client portal.", portal: "Go to the client portal",
  },
};

/** Landing page of the confirmation link. Confirming happens only after clicking the button. */
export default async function ConfirmEmailPage({ searchParams }: { searchParams: Promise<{ bevestig?: string; resultaat?: string; melding?: string }> }) {
  const { bevestig, resultaat, melding } = await searchParams;
  const { locale, lp } = await getI18n();
  const tx = texts[locale];
  const token = bevestig && /^[a-f0-9]{48}$/.test(bevestig) ? bevestig : null;

  return (
    <section className="flex min-h-[80svh] items-center justify-center px-4 pb-16 pt-32">
      <div className="glass w-full max-w-md rounded-3xl p-8 text-center sm:p-10">
        {resultaat === "ok" ? (
          <>
            <CheckCircle2 className="mx-auto size-10 text-emerald-400" />
            <h1 className="mt-4 text-2xl font-semibold">{tx.okTitle}</h1>
            <p className="mt-2 text-sm text-zinc-400">{tx.okText}</p>
          </>
        ) : resultaat === "fout" ? (
          <>
            <XCircle className="mx-auto size-10 text-rose-400" />
            <h1 className="mt-4 text-2xl font-semibold">{tx.failTitle}</h1>
            <p className="mt-2 text-sm text-zinc-400">{melding ?? tx.failText}</p>
          </>
        ) : token ? (
          <>
            <Mail className="mx-auto size-10 text-brand-300" />
            <h1 className="mt-4 text-2xl font-semibold">{tx.confirmTitle}</h1>
            <p className="mt-2 text-sm text-zinc-400">{tx.confirmText}</p>
            <form action={locale === "en" ? "/api/email/bevestig?taal=en" : "/api/email/bevestig"} method="post" className="mt-6">
              <input type="hidden" name="token" value={token} />
              <Button type="submit" className="w-full">{tx.confirm}</Button>
            </form>
          </>
        ) : (
          <>
            <XCircle className="mx-auto size-10 text-rose-400" />
            <h1 className="mt-4 text-2xl font-semibold">{tx.invalidTitle}</h1>
            <p className="mt-2 text-sm text-zinc-400">{tx.invalidText}</p>
          </>
        )}
        <Button asChild variant="secondary" className="mt-4 w-full">
          <Link href={lp("/klantportaal")}>{tx.portal}</Link>
        </Button>
      </div>
    </section>
  );
}
