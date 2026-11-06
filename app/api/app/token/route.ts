import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { avatarUrl, APP_TOKEN_DAYS, encodeAppToken, redeemLoginCode } from "@/lib/session";
import { clientKey, rateLimit } from "@/lib/rate-limit";

/** The Android app swaps its one-time login code (plus its PKCE verifier) for an app token. */
export async function POST(request: Request) {
  const limit = rateLimit(clientKey(await headers(), "app-token"), 20, 10 * 60 * 1000);
  if (!limit.allowed) return NextResponse.json({ fout: "Te veel pogingen. Probeer het later opnieuw." }, { status: 429 });
  const b = ((await request.json().catch(() => null)) ?? {}) as { code?: unknown; verifier?: unknown };
  const user = typeof b.code === "string" && typeof b.verifier === "string" ? redeemLoginCode(b.code, b.verifier) : null;
  if (!user) return NextResponse.json({ fout: "Inloggen is verlopen of ongeldig. Probeer het opnieuw." }, { status: 401 });
  return NextResponse.json(
    {
      token: encodeAppToken(user),
      geldigTot: Date.now() + APP_TOKEN_DAYS * 86_400_000,
      gebruiker: { id: user.id, naam: user.globalName ?? user.username, gebruikersnaam: user.username, avatar: avatarUrl(user) },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
