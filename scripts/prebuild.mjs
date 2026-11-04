/**
 * Draait openstaande database-migraties vlak voor de build.
 *
 * Op Vercel is DATABASE_URL tijdens de build beschikbaar, zodat het schema
 * meeloopt met elke deploy. Is er geen database geconfigureerd, dan slaan we
 * de stap over: de site draait dan op demo-data en moet gewoon kunnen bouwen.
 */
import { execFileSync } from "node:child_process";

if (!process.env.DATABASE_URL) {
  console.log("prebuild: geen DATABASE_URL, migraties overgeslagen (klantportaal toont demo-data).");
  process.exit(0);
}

try {
  console.log("prebuild: migraties uitvoeren…");
  execFileSync("npx", ["prisma", "migrate", "deploy"], { stdio: "inherit" });
} catch {
  console.error("prebuild: migreren is mislukt. Controleer DATABASE_URL en of de database bereikbaar is.");
  process.exit(1);
}
