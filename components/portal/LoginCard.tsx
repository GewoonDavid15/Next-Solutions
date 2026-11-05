import { AlertCircle, Lock, ShieldCheck } from "lucide-react";
import { FadeUp } from "@/components/motion/FadeUp";
import { Button } from "@/components/ui/Button";
import { DiscordIcon } from "@/components/ui/DiscordIcon";
import { Logo } from "@/components/ui/Logo";
import type { Locale } from "@/lib/i18n/config";

const texts = {
  nl: {
    errors: {
      not_configured: "Discord OAuth2 is nog niet geconfigureerd. Gebruik de demo-login.",
      invalid_state: "De login-sessie is verlopen of ongeldig. Probeer het opnieuw.",
      token_exchange: "Discord kon de login niet bevestigen. Probeer het opnieuw.",
      user_fetch: "Je Discord-profiel kon niet worden opgehaald.",
      network: "Discord is tijdelijk niet bereikbaar.",
    } as Record<string, string>,
    title: "Klantportaal",
    intro: "Log in met je Discord account om je projecten, tickets en bugmeldingen te bekijken.",
    login: "Inloggen met Discord",
    notConfigured: "Stel DISCORD_CLIENT_ID en DISCORD_CLIENT_SECRET in",
    demo: "Bekijk demo dashboard",
    scope: "We vragen alleen je publieke profiel (scope: identify)",
  },
  en: {
    errors: {
      not_configured: "Discord OAuth2 has not been configured yet. Use the demo login.",
      invalid_state: "The login session has expired or is invalid. Please try again.",
      token_exchange: "Discord could not confirm the login. Please try again.",
      user_fetch: "Your Discord profile could not be retrieved.",
      network: "Discord is temporarily unreachable.",
    } as Record<string, string>,
    title: "Client portal",
    intro: "Log in with your Discord account to view your projects, tickets and bug reports.",
    login: "Log in with Discord",
    notConfigured: "Set DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET",
    demo: "View demo dashboard",
    scope: "We only ask for your public profile (scope: identify)",
  },
};

export function LoginCard({ error, oauthEnabled, locale = "nl" }: { error?: string; oauthEnabled: boolean; locale?: Locale }) {
  const tx = texts[locale];
  const errors = tx.errors;
  const en = locale === "en";
  return (
    <section className="relative flex min-h-[100svh] items-center justify-center px-4 pb-16 pt-32">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/3 h-80 w-80 -translate-x-1/2 rounded-full bg-brand-600/30 blur-[120px]" />
      <FadeUp className="relative w-full max-w-md">
        <div className="glass rounded-3xl p-8 sm:p-10">
          <div className="flex justify-center">
            <Logo href={en ? "/en" : "/"} />
          </div>
          <div className="mx-auto mt-8 grid size-16 place-items-center rounded-2xl border border-brand-500/30 bg-brand-600/15">
            <Lock className="size-7 text-brand-300" />
          </div>
          <h1 className="mt-6 text-center text-3xl font-semibold">{tx.title}</h1>
          <p className="mt-2 text-center text-sm text-zinc-400">
            {tx.intro}
          </p>

          {error && errors[error] && (
            <p role="alert" className="mt-6 flex items-start gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
              <AlertCircle className="mt-0.5 size-4 shrink-0" /> {errors[error]}
            </p>
          )}

          <div className="mt-8 space-y-3">
            {oauthEnabled ? (
              <Button asChild variant="discord" size="lg" className="w-full">
                <a href={en ? "/api/auth/discord?terug=/en/klantportaal" : "/api/auth/discord"}>
                  <DiscordIcon className="size-5" /> {tx.login}
                </a>
              </Button>
            ) : (
              <Button variant="discord" size="lg" className="w-full" disabled title={tx.notConfigured}>
                <DiscordIcon className="size-5" /> {tx.login}
              </Button>
            )}
            <form action={en ? "/api/auth/demo?taal=en" : "/api/auth/demo"} method="post">
              <Button type="submit" variant="secondary" size="lg" className="w-full">
                {tx.demo}
              </Button>
            </form>
          </div>

          <p className="mt-8 flex items-center justify-center gap-2 text-xs text-zinc-500">
            <ShieldCheck className="size-4 text-emerald-400" /> {tx.scope}
          </p>
        </div>
      </FadeUp>
    </section>
  );
}
