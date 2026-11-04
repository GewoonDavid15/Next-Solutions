# Next Solutions

Website voor **Next Solutions**, een digital agency voor Media, Software en Game Development.

**Stack:** Next.js 15 (App Router, TypeScript) · Tailwind CSS · Framer Motion · Lucide React · Radix UI

## Starten

```bash
npm install
cp .env.example .env.local   # vul je Discord gegevens in
npm run dev                  # http://localhost:3000
```

Zonder `.env.local` draait alles op demo-data: de Discord widget toont voorbeeldcijfers en het klantportaal toont voorbeeldprojecten.

## Pagina's

| Route | Inhoud |
| --- | --- |
| `/` | Hero met typewriter en zwevende parallax-elementen, live teller, kerndiensten, werkwijze, CTA |
| `/diensten` | Grid per afdeling (Software, Game Dev, Media), kaarten met glow + `scale-105` bij hover, FAQ |
| `/prijzen` | Negen pakketten met richtprijzen, levertijden en een FAQ over btw en aanbetalingen |
| `/portfolio` | Masonry-grid met geanimeerde filters (Alle, Bots, Websites, Servers), filter staat in de URL |
| `/portfolio/[slug]` | Case per project: uitdaging, aanpak, resultaat, stack, eigen deel-afbeelding |
| `/over-ons` | Verhaal, waarden, tijdlijn en team |
| `/nieuws` | Artikelen uit `content/blog/*.md`, met overzicht en artikelpagina's |
| `/community` | Live Discord widget (online leden, ledental, kanalen), pulserende "Join de Server" knop |
| `/klantportaal` | Login met Discord OAuth2 (of demo), daarna dashboard met projecten en tickets |
| `/contact` | Offerteformulier in 4 stappen met Radix-dropdowns, optioneel doorgestuurd naar een Discord webhook |
| `/privacy`, `/voorwaarden` | Juridische pagina's (voorbeeldteksten, laten nakijken) |

## Discord integratie

| Variabele | Doel |
| --- | --- |
| `DISCORD_GUILD_ID` | Server ID. Zet aan: *Server Settings → Widget → Enable Server Widget* |
| `NEXT_PUBLIC_DISCORD_INVITE` | Invite-link voor alle "Join" knoppen (ook gebruikt voor het totale ledental) |
| `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET` | OAuth2 app. Redirect URI: `<SITE_URL>/api/auth/discord/callback` |
| `SESSION_SECRET` | Ondertekent de sessie-cookie (verplicht in productie) |
| `DISCORD_CONTACT_WEBHOOK_URL` | Optioneel: offerte-aanvragen worden als embed in dit kanaal gepost |
| `DISCORD_NOTIFY_WEBHOOK_URL` | Optioneel: apart kanaal voor nieuwe tickets en statuswijzigingen |
| `ADMIN_DISCORD_IDS` | Discord user-ids met toegang tot `/beheer`, komma-gescheiden |

## Beheerpaneel

`/beheer` is het beheergedeelte. Zet je Discord user-id in `ADMIN_DISCORD_IDS` (komma-gescheiden voor meerdere beheerders) en log in met Discord. Je kunt er klanten koppelen, projecten aanmaken, status, voortgang en deadlines bijwerken, en tickets afhandelen.

Wie geen beheerder is, belandt gewoon op het klantportaal. Elke bewerking controleert de rechten opnieuw aan de serverkant, dus de paginabeveiliging staat niet op zichzelf.

## Notificaties

Bij een nieuw ticket en bij statuswijzigingen gaat er een bericht naar je Discord via `DISCORD_NOTIFY_WEBHOOK_URL` (of `DISCORD_CONTACT_WEBHOOK_URL` als die niet is ingevuld). Dit gaat naar je eigen kanaal, niet naar de klant: klanten rechtstreeks een bericht sturen zou een Discord-bot met eigen rechten vragen.

## Nieuws schrijven

Artikelen zijn Markdown-bestanden in `content/blog/`. De bestandsnaam wordt de URL. Bovenaan staat frontmatter:

```markdown
---
title: "Titel van het artikel"
description: "Een zin die in het overzicht en in Google verschijnt."
date: "2026-10-28"
author: "Next Solutions"
category: "Software"
---

De tekst van je artikel in Markdown.
```

De leestijd wordt automatisch berekend. Een nieuw bestand verschijnt na de volgende build vanzelf in het overzicht, in de sitemap en met eigen structured data.

## Database (klantportaal)

Het klantportaal gebruikt Prisma met PostgreSQL. Klanten worden herkend aan hun Discord user-id, zodat de OAuth2-login direct de juiste projecten en tickets ophaalt.

```bash
# lokale database, bijvoorbeeld via Docker
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:16

# zet DATABASE_URL in .env.local, daarna:
npm run db:push                                   # schema naar de database
SEED_DISCORD_ID=<jouw-discord-id> npm run db:seed # voorbeeldklant aanmaken
npm run db:studio                                 # data bekijken en bewerken
```

Het schema staat in `prisma/schema.prisma` en kent drie modellen: `Customer`, `Project` en `Ticket`.

Het portaal blijft werken zonder database. Is `DATABASE_URL` niet gezet, is de database onbereikbaar, of wordt de demo-login gebruikt, dan toont het portaal voorbeeldgegevens met een melding erbij. Logt iemand in wiens Discord-account nog niet aan een klant is gekoppeld, dan ziet die een lege staat in plaats van andermans gegevens.

## Live zetten

Zie [DEPLOY.md](./DEPLOY.md) voor het volledige stappenplan naar Vercel, inclusief de environment variables, de Discord redirect-URI en een checklist om na de deploy af te lopen.

## Placeholder-inhoud

Deze onderdelen zijn verzonnen en moeten vervangen worden voordat de site live gaat:

- de negen projecten in `lib/data.ts`, inclusief klantnamen en resultaatcijfers;
- de teamleden op `/over-ons` en de tijdlijn;
- de FAQ-antwoorden op `/diensten`;
- de privacyverklaring en de algemene voorwaarden.

## Structuur

```
app/                 routes, API routes (discord, auth, contact), template.tsx (page transitions)
components/
  layout/            Navbar (sticky glass, krimpt bij scrollen), Footer
  motion/            FadeUp, Stagger, Typewriter, AnimatedCounter
  sections/          Hero, CoreServices, PortfolioGrid, DiscordWidget, QuoteForm, ...
  portal/            LoginCard, Dashboard
  ui/                Button (cva), Card, Badge, Select (Radix), SectionHeading, ...
  admin/             AdminDashboard, dialogen voor nieuwe klanten en projecten
lib/                 data, prijzen, blog, Discord API, sessie/OAuth, rate limiting, notificaties
content/blog/        artikelen als Markdown
prisma/              schema.prisma, migraties en seed.ts
scripts/             prebuild.mjs (draait migraties voor de build)
tailwind.config.ts   kleuren, fonts, glow-shadows, keyframes
```
