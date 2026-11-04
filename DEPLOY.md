# Deployen naar Vercel

Stappenplan om de site live te zetten. Reken op twintig minuten, exclusief het wachten op DNS.

## 1. Repository koppelen

Ga naar [vercel.com/new](https://vercel.com/new), kies deze repository en importeer hem. Vercel herkent Next.js automatisch; je hoeft het framework, de build command en de output directory niet aan te passen.

Klik nog **niet** op Deploy. Zet eerst de environment variables, anders mislukt de eerste build of start de site met demo-data.

## 2. Database aanmaken

Je hebt een PostgreSQL-database nodig. Twee opties die zonder creditcard werken:

- **Vercel Postgres** — in je project onder *Storage → Create Database*. Vercel zet `DATABASE_URL` dan zelf klaar.
- **[Neon](https://neon.tech)** of **[Supabase](https://supabase.com)** — maak een database en kopieer de connection string.

Gebruik je Neon of Supabase, neem dan de **pooled** connection string (die met `-pooler` of `pgbouncer=true` erin). Serverless functies openen veel korte verbindingen; zonder pooling loop je tegen het verbindingslimiet aan.

Migraties draaien automatisch tijdens elke build, dus je hoeft het schema niet handmatig aan te maken.

## 3. Discord-app instellen

Op [discord.com/developers/applications](https://discord.com/developers/applications):

1. **OAuth2 → Redirects**: voeg `https://jouwdomein.nl/api/auth/discord/callback` toe. Dit moet exact overeenkomen, inclusief `https` en zonder slash op het eind.
2. **OAuth2**: kopieer de Client ID en genereer een Client Secret.
3. In je Discord-server, onder **Server Settings → Widget**: zet *Enable Server Widget* aan en kopieer de Server ID. Zonder deze stap blijft de community-pagina op voorbeeldcijfers staan.

## 4. Environment variables

Zet deze in Vercel onder *Settings → Environment Variables*, voor Production én Preview.

| Variabele | Waarde | Verplicht |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://jouwdomein.nl` | Ja |
| `SESSION_SECRET` | Lange willekeurige string, zie hieronder | Ja |
| `DATABASE_URL` | Connection string van je database | Voor het klantportaal |
| `DISCORD_CLIENT_ID` | Uit je Discord-app | Voor de login |
| `DISCORD_CLIENT_SECRET` | Uit je Discord-app | Voor de login |
| `DISCORD_GUILD_ID` | Je server-ID | Voor live ledentallen |
| `NEXT_PUBLIC_DISCORD_INVITE` | `https://discord.gg/jouwcode` | Aanbevolen |
| `DISCORD_CONTACT_WEBHOOK_URL` | Webhook-URL van je offertekanaal | Optioneel |

Genereer het sessiegeheim met:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Bewaar dat geheim. Verander je het later, dan worden alle actieve sessies ongeldig en moet iedereen opnieuw inloggen.

Ontbreekt `SESSION_SECRET` in productie, dan laadt de site gewoon, maar loopt het inloggen stuk met een foutmelding. Dat is met opzet: sessiecookies worden liever helemaal niet ondertekend dan met een standaardsleutel die iedereen kan raden.

## 5. Deployen en koppelen

Klik op Deploy. Daarna:

```bash
# voorbeeldklant koppelen aan jouw Discord-account
DATABASE_URL="<je-productie-url>" SEED_DISCORD_ID=<jouw-discord-id> npm run db:seed

# of beheer klanten via de browser
DATABASE_URL="<je-productie-url>" npm run db:studio
```

Je Discord user-id vind je door in Discord *Instellingen → Geavanceerd → Ontwikkelaarsmodus* aan te zetten, en daarna rechts te klikken op je eigen naam en *Gebruikers-ID kopiëren* te kiezen.

## 6. Domein

Voeg je domein toe onder *Settings → Domains* en volg de DNS-instructies. Vergeet daarna niet om:

- `NEXT_PUBLIC_SITE_URL` bij te werken naar het echte domein;
- de redirect-URI in de Discord-app aan te passen naar datzelfde domein.

Deze twee worden het vaakst vergeten. Klopt `NEXT_PUBLIC_SITE_URL` niet, dan wijzen de sitemap, de deel-afbeelding en de OAuth-redirect naar het oude adres.

## Preview deployments

Elke pull request krijgt een eigen URL. Omdat `NEXT_PUBLIC_SITE_URL` vastligt op productie, stuurt de Discord-login vanaf een preview door naar productie. Wil je ook op previews kunnen inloggen, voeg dan de preview-URL toe aan de redirects van je Discord-app en zet `NEXT_PUBLIC_SITE_URL` voor de Preview-omgeving op diezelfde URL.

## Controleren of alles werkt

Loop na de deploy deze punten af:

- [ ] `/` laadt en de teller telt op
- [ ] `/community` toont het echte ledental, niet 4.280 (dat is het demogetal)
- [ ] `/klantportaal` → "Inloggen met Discord" werkt en stuurt je terug naar de site
- [ ] Na inloggen zie je jouw projecten, zonder de gele melding over voorbeeldgegevens
- [ ] `/contact` → een testaanvraag komt binnen in je Discord-kanaal
- [ ] `/sitemap.xml` noemt je eigen domein

## Zonder database deployen

Dat kan. Laat `DATABASE_URL` dan weg: de build slaat de migraties over en het klantportaal toont voorbeeldgegevens met een melding erbij. Handig om de site vast live te zetten en het portaal later aan te sluiten.
