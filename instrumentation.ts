/**
 * Server errors (a page or API route that crashes) are reported to the bot, which keeps a list
 * in the dashboard and sends the owner a message about new ones.
 */
export async function register() {}

export async function onRequestError(error: unknown, request: { path: string; method: string }, context: { routeType: string }) {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { reportServerError } = await import("./lib/report-server-error");
    await reportServerError(error, request, context);
  }
}
