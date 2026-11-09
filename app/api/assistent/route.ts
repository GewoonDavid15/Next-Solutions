import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { answer } from "@/lib/assistent";
import { clientKey, rateLimit } from "@/lib/rate-limit";

/** Help assistant: answers with passages from the knowledge base, FAQ and service pages. */
export async function POST(request: Request) {
  const limit = rateLimit(clientKey(await headers(), "assistent"), 60, 60 * 60 * 1000);
  if (!limit.allowed) return NextResponse.json({ fout: "Te veel vragen, probeer het later opnieuw." }, { status: 429 });
  const b = ((await request.json().catch(() => null)) ?? {}) as { vraag?: unknown; taal?: unknown };
  const vraag = typeof b.vraag === "string" ? b.vraag.slice(0, 300) : "";
  if (vraag.trim().length < 2) return NextResponse.json({ fout: "Stel een vraag." }, { status: 400 });
  return NextResponse.json(answer(vraag, b.taal === "en" ? "en" : "nl"));
}
