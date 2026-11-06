"use client";

import { useEffect } from "react";
import { reportError } from "@/lib/report-error";

/** Last resort when even the layout crashes: a plain page, and the error is reported. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => reportError(error, { digest: error.digest }), [error]);
  return (
    <html lang="nl">
      <body style={{ margin: 0, minHeight: "100vh", display: "grid", placeItems: "center", background: "#0A0C10", color: "#e4e4e7", fontFamily: "system-ui, sans-serif", textAlign: "center", padding: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, color: "#fff" }}>Er ging iets mis</h1>
          <p style={{ color: "#a1a1aa" }}>De pagina kon niet geladen worden. We hebben een melding gekregen.</p>
          <button type="button" onClick={reset} style={{ marginTop: 16, background: "#C6F432", color: "#0A0C10", border: 0, borderRadius: 12, padding: "10px 18px", fontWeight: 700, cursor: "pointer" }}>Probeer opnieuw</button>
        </div>
      </body>
    </html>
  );
}
