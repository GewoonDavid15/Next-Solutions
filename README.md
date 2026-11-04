# Next Solutions

Website voor **Next Solutions**, een digital agency voor Media, Software en Game Development.

**Stack:** Next.js 15 (App Router, TypeScript) · Tailwind CSS · Framer Motion · Lucide React · Radix UI

## Starten

```bash
npm install
cp .env.example .env.local   # vul je Discord gegevens in
npm run dev                  # http://localhost:3000
```

Zonder `.env.local` draait alles op demo-data: de Discord widget toont voorbeeldcijfers en het klantportaal heeft een demo-login.

## Pagina's

| Route | Inhoud |
| --- | --- |
| `/` | Hero met typewriter en zwevende parallax-elementen, live teller, kerndiensten, werkwijze, CTA |
| `/diensten` | Grid per afdeling (Software, Game Dev, Media), kaarten met glow + `scale-105` bij hover |
| `/portfolio` | Masonry-grid met geanimeerde filters (Alle, Bots, Websites, Servers) |
| `/community` | Live Discord widget (online leden, ledental, kanalen), pulserende "Join de Server" knop |
| `/klantportaal` | Login met Discord OAuth2 (of demo), daarna dashboard met projecten en tickets |
| `/contact` | Offerteformulier in 4 stappen met Radix-dropdowns, optioneel doorgestuurd naar een Discord webhook |

## Discord integratie

| Variabele | Doel |
| --- | --- |
| `DISCORD_GUILD_ID` | Server ID. Zet aan: *Server Settings → Widget → Enable Server Widget* |
| `NEXT_PUBLIC_DISCORD_INVITE` | Invite-link voor alle "Join" knoppen (ook gebruikt voor het totale ledental) |
| `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET` | OAuth2 app. Redirect URI: `<SITE_URL>/api/auth/discord/callback` |
| `SESSION_SECRET` | Ondertekent de sessie-cookie (verplicht in productie) |
| `DISCORD_CONTACT_WEBHOOK_URL` | Optioneel: offerte-aanvragen worden als embed in dit kanaal gepost |

De projecten en tickets in het klantportaal komen uit `lib/portal.ts` (mockdata). Koppel daar je eigen database of CRM aan, op basis van het Discord user-id.

## Structuur

```
app/                 routes, API routes (discord, auth, contact), template.tsx (page transitions)
components/
  layout/            Navbar (sticky glass, krimpt bij scrollen), Footer
  motion/            FadeUp, Stagger, Typewriter, AnimatedCounter
  sections/          Hero, CoreServices, PortfolioGrid, DiscordWidget, QuoteForm, ...
  portal/            LoginCard, Dashboard
  ui/                Button (cva), Card, Badge, Select (Radix), SectionHeading, ...
lib/                 data, Discord API, sessie/OAuth helpers, formuliervalidatie
tailwind.config.ts   kleuren, fonts, glow-shadows, keyframes
```
