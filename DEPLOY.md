# Deployen naar Vercel

Stappenplan om de site live te zetten. Reken op twintig minuten, exclusief het wachten op DNS.
Er is geen database nodig: klantgegevens, tickets en het dashboard komen uit je Discord-bot.

## 0. Voordat je begint

- De bot draait op Craftnode met de bestanden uit deze fase, en in zijn `.env` staat een
  `DASHBOARD_SECRET` van minimaal 32 tekens.
- Je weet het IP-adres en de poort van je Craftnode-server (bijv. `123.45.67.89:25565`).

## 1. Repository koppelen

1. Log in op [vercel.com](https://vercel.com) met je GitHub-account.
2. Ga naar [vercel.com/new](https://vercel.com/new), kies de repository `Next-Solutions` en klik op **Import**.
3. Vercel herkent Next.js zelf. Je hoeft het framework, de build command en de output directory niet aan te passen.
4. Klik nog **niet** op Deploy. Zet eerst de environment variables (stap 3).

Vercel bouwt standaard de **standaardbranch** van GitHub. Staat je werk op een andere branch, kies die dan
na het importeren onder *Settings → Git → Production Branch*, of voeg de branches eerst samen.

## 2. Discord-app instellen

Op [discord.com/developers/applications](https://discord.com/developers/applications), bij je bot-applicatie:

1. **OAuth2 → Redirects**: voeg `https://nextsolutionshq.nl/api/auth/discord/callback` toe. Dit moet exact
   overeenkomen, inclusief `https` en zonder slash op het eind.
2. **OAuth2**: kopieer de Client ID en maak een Client Secret.
3. In je Discord-server, onder **Serverinstellingen → Widget**: zet *Serverwidget inschakelen* aan.
   Zonder deze stap blijft de communitypagina op voorbeeldcijfers staan.

## 3. Environment variables

Zet deze in Vercel onder *Settings → Environment Variables*, voor Production én Preview.

| Variabele | Waarde | Verplicht |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | `https://nextsolutionshq.nl` | Ja |
| `SESSION_SECRET` | Lange willekeurige string, zie hieronder | Ja |
| `DISCORD_CLIENT_ID` | Uit je Discord-app | Voor de login |
| `DISCORD_CLIENT_SECRET` | Uit je Discord-app | Voor de login |
| `DISCORD_GUILD_ID` | ID van je Discord-server | Voor live ledentallen |
| `NEXT_PUBLIC_DISCORD_INVITE` | `https://discord.gg/jouwcode` | Aanbevolen |
| `BOT_API_URL` | `http://IP-van-craftnode:poort`, zonder `/` op het eind | Voor live data, portaal en dashboard |
| `BOT_API_SECRET` | Precies dezelfde waarde als `DASHBOARD_SECRET` van de bot | Voor live data, portaal en dashboard |
| `DASHBOARD_OWNER_ID` | Jouw eigen Discord-ID | Voor het bot-dashboard |
| `DISCORD_CONTACT_WEBHOOK_URL` | Webhook-URL van je offertekanaal | Optioneel |

Genereer `SESSION_SECRET` (en eventueel de bot-sleutel) met:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Gebruik voor `SESSION_SECRET` een andere sleutel dan voor de bot. Verander je hem later, dan moet iedereen
opnieuw inloggen.

Je Discord-ID vind je door in Discord *Instellingen → Geavanceerd → Ontwikkelaarsmodus* aan te zetten, en
daarna rechts te klikken op je eigen naam en *Gebruikers-ID kopiëren* te kiezen.

## 4. Deployen

Klik op **Deploy**. Na een paar minuten staat de site op een `*.vercel.app`-adres. Controleer daar:

1. `/klantportaal`: inloggen met Discord werkt en je ziet je eigen gegevens en de knop **Bot-dashboard**.
2. `/dashboard`: de bot staat als online en instellingen laden.
3. `/status`, `/team`, `/reviews`, `/community`: tonen live data uit de bot.
4. De **EN**-knop rechtsboven: de Engelse versie werkt.

Zie je "live gegevens tijdelijk niet beschikbaar", dan bereikt de website de bot niet. Controleer
`BOT_API_URL`, of de sleutels precies gelijk zijn, en of de bot draait.

## 5. Domein

Voeg je domein toe onder *Settings → Domains* en volg de DNS-instructies. Vergeet daarna niet om:

- `NEXT_PUBLIC_SITE_URL` bij te werken naar het echte domein, en opnieuw te deployen;
- de redirect-URI in de Discord-app aan te passen naar datzelfde domein;
- in de bot `email.js` → `WEBSITE_URL` op hetzelfde domein te zetten (voor de links in e-mails).

## Preview deployments

Elke pull request krijgt een eigen URL. Omdat `NEXT_PUBLIC_SITE_URL` vastligt op productie, stuurt de
Discord-login vanaf een preview door naar productie. Wil je ook op previews kunnen inloggen, voeg dan de
preview-URL toe aan de redirects van je Discord-app en zet `NEXT_PUBLIC_SITE_URL` voor de Preview-omgeving
op diezelfde URL.
