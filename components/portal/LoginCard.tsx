import { AlertCircle, Lock, ShieldCheck } from "lucide-react";
import { FadeUp } from "@/components/motion/FadeUp";
import { Button } from "@/components/ui/Button";
import { DiscordIcon } from "@/components/ui/DiscordIcon";
import { Logo } from "@/components/ui/Logo";

const errors: Record<string, string> = {
  not_configured: "Discord OAuth2 is nog niet geconfigureerd. Gebruik de demo-login.",
  invalid_state: "De login-sessie is verlopen of ongeldig. Probeer het opnieuw.",
  token_exchange: "Discord kon de login niet bevestigen. Probeer het opnieuw.",
  user_fetch: "Je Discord-profiel kon niet worden opgehaald.",
  network: "Discord is tijdelijk niet bereikbaar.",
};

export function LoginCard({ error, oauthEnabled }: { error?: string; oauthEnabled: boolean }) {
  return (
    <section className="relative flex min-h-[100svh] items-center justify-center px-4 pb-16 pt-32">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/3 h-80 w-80 -translate-x-1/2 rounded-full bg-brand-600/30 blur-[120px]" />
      <FadeUp className="relative w-full max-w-md">
        <div className="glass rounded-3xl p-8 sm:p-10">
          <div className="flex justify-center">
            <Logo />
          </div>
          <div className="mx-auto mt-8 grid size-16 place-items-center rounded-2xl border border-brand-500/30 bg-brand-600/15">
            <Lock className="size-7 text-brand-300" />
          </div>
          <h1 className="mt-6 text-center text-3xl font-semibold">Klantportaal</h1>
          <p className="mt-2 text-center text-sm text-zinc-400">
            Log in met je Discord account om je projecten, facturen en tickets te bekijken.
          </p>

          {error && errors[error] && (
            <p role="alert" className="mt-6 flex items-start gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
              <AlertCircle className="mt-0.5 size-4 shrink-0" /> {errors[error]}
            </p>
          )}

          <div className="mt-8 space-y-3">
            {oauthEnabled ? (
              <Button asChild variant="discord" size="lg" className="w-full">
                <a href="/api/auth/discord">
                  <DiscordIcon className="size-5" /> Inloggen met Discord
                </a>
              </Button>
            ) : (
              <Button variant="discord" size="lg" className="w-full" disabled title="Stel DISCORD_CLIENT_ID en DISCORD_CLIENT_SECRET in">
                <DiscordIcon className="size-5" /> Inloggen met Discord
              </Button>
            )}
            <form action="/api/auth/demo" method="post">
              <Button type="submit" variant="secondary" size="lg" className="w-full">
                Bekijk demo dashboard
              </Button>
            </form>
          </div>

          <p className="mt-8 flex items-center justify-center gap-2 text-xs text-zinc-500">
            <ShieldCheck className="size-4 text-emerald-400" /> We vragen alleen je publieke profiel (scope: identify)
          </p>
        </div>
      </FadeUp>
    </section>
  );
}
