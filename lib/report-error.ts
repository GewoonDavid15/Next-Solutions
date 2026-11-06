"use client";

/**
 * Sends a short description of an error in the browser to our own error log (via the bot),
 * so the owner hears about broken pages. No personal data: only the message, the page and the browser.
 */
const sent = new Set<string>();

export function reportError(error: unknown, extra?: { digest?: string }) {
  try {
    const err = error instanceof Error ? error : new Error(String(error));
    const bericht = `${err.name}: ${err.message}`.slice(0, 500);
    const key = `${bericht}|${location.pathname}`;
    if (sent.has(key) || sent.size > 20) return;
    sent.add(key);
    const ua = navigator.userAgent;
    const browser = /Edg\//.test(ua) ? "Edge" : /Firefox\//.test(ua) ? "Firefox" : /Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : "Overig";
    const body = JSON.stringify({ bericht, pad: location.pathname, stack: (err.stack ?? "").slice(0, 3000), digest: extra?.digest, browser: `${browser}${/Mobi/.test(ua) ? " (mobiel)" : ""}` });
    if (!navigator.sendBeacon?.("/api/fout", new Blob([body], { type: "application/json" }))) {
      fetch("/api/fout", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {});
    }
  } catch {
    // Reporting must never cause a second error
  }
}
