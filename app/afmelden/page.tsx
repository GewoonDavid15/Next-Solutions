import { CheckCircle2, MailX, XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata() {
  const { locale } = await getI18n();
  return { title: locale === "en" ? "Unsubscribe" : "Afmelden", robots: { index: false } };
}

const texts = {
  nl: {
    doneTitle: "Je bent afgemeld", doneText: "Je krijgt geen e-mailmeldingen meer en je e-mailadres is verwijderd. Je kunt je altijd opnieuw aanmelden in het klantportaal.",
    failTitle: "Afmelden lukte niet", failText: "Misschien was je al afgemeld. Je kunt het ook regelen in je klantportaal.",
    askTitle: "Afmelden voor e-mails", askText: "Wil je geen e-mailmeldingen van Next Solutions meer ontvangen?", yes: "Ja, afmelden",
    invalidTitle: "Ongeldige link", invalidText: "Gebruik de link uit de mail, of zet meldingen uit in je klantportaal.", portal: "Naar het klantportaal",
  },
  en: {
    doneTitle: "You've been unsubscribed", doneText: "You won't receive email notifications any more and your email address has been removed. You can always sign up again in the client portal.",
    failTitle: "Unsubscribing didn't work", failText: "Maybe you were already unsubscribed. You can also manage this in your client portal.",
    askTitle: "Unsubscribe from emails", askText: "Don't want to receive email notifications from Next Solutions any more?", yes: "Yes, unsubscribe",
    invalidTitle: "Invalid link", invalidText: "Use the link from the email, or turn off notifications in your client portal.", portal: "Go to the client portal",
  },
};

/** Unsubscribe page from the link in every email. Works without logging in. */
export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<{ token?: string; gedaan?: string }> }) {
  const { token, gedaan } = await searchParams;
  const { locale, lp } = await getI18n();
  const tx = texts[locale];
  const valid = token && /^[a-f0-9]{48}$/.test(token) ? token : null;

  return (
    <section className="flex min-h-[80svh] items-center justify-center px-4 pb-16 pt-32">
      <div className="glass w-full max-w-md rounded-3xl p-8 text-center sm:p-10">
        {gedaan === "1" ? (
          <>
            <CheckCircle2 className="mx-auto size-10 text-emerald-400" />
            <h1 className="mt-4 text-2xl font-semibold">{tx.doneTitle}</h1>
            <p className="mt-2 text-sm text-zinc-400">{tx.doneText}</p>
          </>
        ) : gedaan === "0" ? (
          <>
            <XCircle className="mx-auto size-10 text-rose-400" />
            <h1 className="mt-4 text-2xl font-semibold">{tx.failTitle}</h1>
            <p className="mt-2 text-sm text-zinc-400">{tx.failText}</p>
          </>
        ) : valid ? (
          <>
            <MailX className="mx-auto size-10 text-brand-300" />
            <h1 className="mt-4 text-2xl font-semibold">{tx.askTitle}</h1>
            <p className="mt-2 text-sm text-zinc-400">{tx.askText}</p>
            <form action={locale === "en" ? "/api/email/afmelden?taal=en" : "/api/email/afmelden"} method="post" className="mt-6">
              <input type="hidden" name="token" value={valid} />
              <Button type="submit" className="w-full">{tx.yes}</Button>
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
