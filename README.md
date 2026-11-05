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
| `/klantportaal` | Login met Discord OAuth2 (of demo). Echte klanten zien live hun projecten, tickets, transcripts van gesloten tickets, bestanden, bugmeldingen en sollicitaties, kunnen een ticket openen en e-mailmeldingen aanzetten; de demo toont voorbeelddata |
| `/status` | Openbare statuspagina: uptime per dienst (24 uur), drukte van support, openingstijden en recente storingen, live uit de bot |
| `/team` | Teamleden met de staff-rollen uit de bot, met functie, afdelingen en skills |
| `/reviews` | Reviews van klanten (gevraagd door de bot na elk ticket en project), met gemiddelde en verdeling. De nieuwste staan ook op de homepage |
| `/vacatures` | Open vacatures uit de bot. Solliciteren gaat met Discord-login; het team beoordeelt in Discord |
| `/contact` | Offerteformulier in 4 stappen met Radix-dropdowns, optioneel doorgestuurd naar een Discord webhook |
| `/dashboard` | Bot-dashboard, alleen voor de eigenaar: overzicht met grafieken, instellingen van alle bot-systemen, botstatus, scripts, live console en een wijzigingslog met terugdraaien |

## Talen (NL / EN)

De site is tweetalig. Nederlands staat op de gewone adressen, Engels onder `/en` (bijv. `/en/diensten`).
`middleware.ts` herschrijft `/en/...` naar dezelfde pagina en geeft de taal door; er zijn dus geen dubbele pagina's.

- Gedeelde teksten (navigatie, footer, CTA): `lib/i18n/messages/nl.ts` en `en.ts`
- Teksten van één component staan in dat component als `{ nl, en }`
- Inhoud (diensten, cases, FAQ, statistieken): Nederlands in `lib/data.ts`, Engels in `lib/content-en.ts`
- Server components: `await getI18n()` → `{ locale, t, content, lp }`; client components: `useI18n()`
- Links binnen de site altijd via `lp("/pad")`, zodat Engelse bezoekers in het Engels blijven

Niet vertaald: het bot-dashboard (`/dashboard`) en alles wat de bot zelf aanlevert (reviews, vacatures, team-bio's,
projectnotities, e-mails en Discord-berichten).

## Discord integratie

| Variabele | Doel |
| --- | --- |
| `DISCORD_GUILD_ID` | Server ID. Zet aan: *Server Settings → Widget → Enable Server Widget* |
| `NEXT_PUBLIC_DISCORD_INVITE` | Invite-link voor alle "Join" knoppen (ook gebruikt voor het totale ledental) |
| `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET` | OAuth2 app. Redirect URI: `<SITE_URL>/api/auth/discord/callback` |
| `SESSION_SECRET` | Ondertekent de sessie-cookie (verplicht in productie) |
| `DISCORD_CONTACT_WEBHOOK_URL` | Optioneel: offerte-aanvragen worden als embed in dit kanaal gepost |

De projecten en tickets in het klantportaal komen uit `lib/portal.ts` (mockdata). Koppel daar je eigen database of CRM aan, op basis van het Discord user-id.

## Bot-dashboard

Bestanden zet je team klaar in Discord met `/bestand upload`; de bot bewaart ze op zijn eigen server en de klant downloadt ze in het portaal. E-mailmeldingen (opt-in met bevestigingsmail, afmeldlink in elke mail) verstuurt de bot via Resend zodra `RESEND_API_KEY` in de `.env` van de bot staat.

De contactpagina toont de live drukte en reactietijd van support. Zonder gekoppelde bot vallen alle live onderdelen terug op vaste teksten.

`/dashboard` beheert de Discord bot via een kleine API in de bot zelf (`Systeem/dashboard-api.js`). De website stuurt verzoeken door via `app/api/bot/[...pad]` en ondertekent elk verzoek met een HMAC, zodat de sleutel nooit over het netwerk gaat.

| Variabele | Doel |
| --- | --- |
| `DASHBOARD_OWNER_ID` | Jouw Discord user-ID. Alleen dit account kan `/dashboard` openen; iedereen anders krijgt een 404 |
| `BOT_API_URL` | Adres van de bot-API, bijv. `http://123.45.67.89:25565` (IP + poort van de bot-host) |
| `BOT_API_SECRET` | Zelfde sleutel als `DASHBOARD_SECRET` in de `.env` van de bot (min. 32 tekens) |

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
