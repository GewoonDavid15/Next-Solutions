import { botRequest, isBotApiConfigured } from "@/lib/bot-api";

/** Sends a server error (a crashing page or API route) to the bot's error log. Never throws. */
export async function reportServerError(error: unknown, request: { path: string; method: string }, context: { routeType: string }) {
  try {
    if (!isBotApiConfigured()) return;
    const err = error instanceof Error ? error : new Error(String(error));
    const digest = (error as { digest?: string }).digest;
    // Next.js uses errors for notFound() and redirects; those are not real problems
    if (typeof digest === "string" && /^(NEXT_NOT_FOUND|NEXT_REDIRECT|NEXT_HTTP_ERROR_FALLBACK|DYNAMIC_SERVER_USAGE)/.test(digest)) return;
    await botRequest("POST", "/fout", JSON.stringify({
      bron: "server",
      bericht: `${err.name}: ${err.message}`.slice(0, 500),
      pad: `${request.method} ${request.path.split("?")[0]}`.slice(0, 200),
      stack: `${context.routeType}\n${err.stack ?? ""}`.slice(0, 3000),
      digest,
    }));
  } catch {
    // Never let error reporting cause another error
  }
}
