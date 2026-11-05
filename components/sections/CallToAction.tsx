import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { FadeUp } from "@/components/motion/FadeUp";
import { Button } from "@/components/ui/Button";
import { DiscordIcon } from "@/components/ui/DiscordIcon";
import { getI18n } from "@/lib/i18n/server";
import { site } from "@/lib/site";

interface CallToActionProps {
  title?: React.ReactNode;
  description?: string;
}

export async function CallToAction({ title, description }: CallToActionProps) {
  const { t, lp } = await getI18n();
  title ??= <>{t.cta.titleBefore}<span className="text-gradient">{t.cta.titleHighlight}</span>{t.cta.titleAfter}</>;
  description ??= t.cta.description;
  return (
    <section className="section">
      <div className="container">
        <FadeUp>
          <div className="relative overflow-hidden rounded-3xl border border-brand-500/30 bg-gradient-to-br from-brand-700/30 via-ink-800 to-ink px-6 py-16 text-center shadow-glow-lg sm:px-16 sm:py-20">
            <div aria-hidden className="absolute -left-20 -top-20 size-72 rounded-full bg-brand-600/40 blur-[100px]" />
            <div aria-hidden className="absolute -bottom-24 -right-10 size-72 rounded-full bg-fuchsia-600/30 blur-[100px]" />
            <div className="relative">
              <h2 className="mx-auto max-w-3xl text-3xl font-semibold tracking-tight sm:text-5xl">{title}</h2>
              <p className="mx-auto mt-5 max-w-xl text-zinc-300">{description}</p>
              <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href={lp("/contact")}>
                    {t.cta.quote} <ArrowRight className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button asChild variant="secondary" size="lg">
                  <a href={site.discordInvite} target="_blank" rel="noopener noreferrer">
                    <DiscordIcon className="size-5" /> {t.cta.discord}
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
