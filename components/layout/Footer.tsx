import { Mail } from "lucide-react";
import Link from "next/link";
import { DiscordIcon } from "@/components/ui/DiscordIcon";
import { Logo } from "@/components/ui/Logo";
import { GithubIcon, InstagramIcon, XIcon, YoutubeIcon } from "@/components/ui/SocialIcons";
import { getI18n } from "@/lib/i18n/server";
import { navLinks, site } from "@/lib/site";

const socials = [
  { label: "Discord", href: site.discordInvite, icon: DiscordIcon },
  { label: "Twitter / X", href: "https://x.com", icon: XIcon },
  { label: "Instagram", href: "https://instagram.com", icon: InstagramIcon },
  { label: "YouTube", href: "https://youtube.com", icon: YoutubeIcon },
  { label: "GitHub", href: "https://github.com", icon: GithubIcon },
];

export async function Footer() {
  const { t, content, lp } = await getI18n();
  return (
    <footer className="relative mt-24 border-t border-white/5 bg-ink/80">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-600/60 to-transparent" />
      <div className="container py-16">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo href={lp("/")} />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-zinc-400">
              {t.footer.tagline}
            </p>
            <a href={`mailto:${site.email}`} className="mt-5 inline-flex items-center gap-2 text-sm text-zinc-300 hover:text-white">
              <Mail className="size-4 text-brand-400" /> {site.email}
            </a>
          </div>

          <FooterColumn title={t.footer.sitelinks} className="lg:col-span-2">
            {[
              ...navLinks.map((l) => ({ href: l.href, label: t.nav.links[l.href] ?? l.label })),
              { href: "/team", label: t.footer.extra.team },
              { href: "/reviews", label: t.footer.extra.reviews },
              { href: "/vacatures", label: t.footer.extra.vacatures },
              { href: "/status", label: t.footer.extra.status },
            ].map((l) => (
              <FooterLink key={l.href} href={lp(l.href)}>
                {l.label}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title={t.footer.services} className="lg:col-span-3">
            {content.services.slice(0, 6).map((s) => (
              <FooterLink key={s.title} href={lp("/diensten")}>
                {s.title}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title={t.footer.socials} className="lg:col-span-3">
            {socials.map(({ label, href, icon: Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-3 text-sm text-zinc-400 transition-colors hover:text-white"
                >
                  <span className="grid size-8 place-items-center rounded-xl border border-white/10 bg-white/[0.03] transition-all group-hover:border-brand-500/50 group-hover:shadow-glow">
                    <Icon className="size-4" />
                  </span>
                  {label}
                </a>
              </li>
            ))}
          </FooterColumn>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 text-xs text-zinc-500 sm:flex-row">
          <p>© {new Date().getFullYear()} {site.name}. {t.footer.rights}</p>
          <div className="flex gap-6">
            <Link href={lp("/privacy")} className="hover:text-zinc-300">{t.footer.privacy}</Link>
            <Link href={lp("/voorwaarden")} className="hover:text-zinc-300">{t.footer.terms}</Link>
          </div>
        </div>

        <p className="mt-10 text-center font-display text-lg text-zinc-300 sm:text-xl">
          Made by{" "}
          <span className="inline-block animate-pulse-glow bg-gradient-to-r from-brand-400 via-brand-600 to-fuchsia-500 bg-clip-text font-bold text-transparent">
            nexify
          </span>
        </p>
      </div>
    </footer>
  );
}

function FooterColumn({ title, className, children }: { title: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">{title}</h3>
      <ul className="space-y-3">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-sm text-zinc-400 transition-colors hover:text-white">
        {children}
      </Link>
    </li>
  );
}
