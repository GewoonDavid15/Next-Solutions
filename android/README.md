# Android-app (Trusted Web Activity)

De Android-app opent het klantportaal van nextsolutionshq.nl in Chrome, als app, zonder adresbalk.
Pushmeldingen van de website komen binnen als meldingen van de app.

## Opnieuw bouwen

Nodig: JDK 17+, Gradle 8.9+ en de Android SDK (platform 35, build-tools 35).

1. Zet `sdk.dir=/pad/naar/android-sdk` in `android/local.properties`.
2. Zet de ondertekensleutel `release.keystore` en `signing.properties` in `android/` (staan **niet** in git).
3. Verhoog `versionCode` en `versionName` in `app/build.gradle`.
4. `gradle assembleRelease`; de APK staat in `app/build/outputs/apk/release/`.
5. Kopieer hem naar `public/downloads/next-solutions.apk`.

Gebruik altijd dezelfde sleutel: anders kunnen bestaande installaties niet updaten en klopt
`public/.well-known/assetlinks.json` niet meer (dan verschijnt er weer een adresbalk).
