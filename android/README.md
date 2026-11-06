# Next Solutions Android-app

Native Android-app (Kotlin + Jetpack Compose) voor het klantportaal.

## Wat de app doet
- **Inloggen met Discord** via de website: de app maakt een geheime sleutel (PKCE), opent de Discord-login
  in een browsertabblad en krijgt via `https://nextsolutionshq.nl/app/login` een eenmalige code terug.
  Alleen de app die de sleutel kent, kan die code inwisselen voor een token (`/api/app/token`, 90 dagen geldig).
- **Overzicht**: projecten, open tickets, offertes, meldingen en je niveau.
- **Projecten** met fases, updates en knoppen voor akkoord of revisie.
- **Tickets**: chatten met het team (verschijnt in Discord) en nieuwe tickets openen.
- **Offertes** bekijken en accepteren, met de betaalinstructie.
- **Meldingen**, **afspraken plannen**, **bestanden downloaden**.
- **Meldingen op je telefoon**: elke 15 minuten kijkt de app op de achtergrond of er iets nieuws is.

De app praat met de website (`/api/app/data` en de bestaande `/api/portaal/*`-routes) met
`Authorization: Bearer <token>`. De website stuurt alles door naar de Discord-bot.

## Opnieuw bouwen
Nodig: JDK 17+, Gradle 8.9+ en de Android SDK (platform 35, build-tools 35).

1. Zet `sdk.dir=/pad/naar/android-sdk` in `android/local.properties`.
2. Zet de ondertekensleutel `release.keystore` en `signing.properties` in `android/` (staan **niet** in git).
3. Verhoog `versionCode` en `versionName` in `app/build.gradle`.
4. `gradle testReleaseUnitTest assembleRelease`; de APK staat in `app/build/outputs/apk/release/`.
5. Kopieer hem naar `public/downloads/next-solutions.apk`.

Gebruik altijd dezelfde sleutel: anders kunnen bestaande installaties niet updaten en klopt
`public/.well-known/assetlinks.json` niet meer.
