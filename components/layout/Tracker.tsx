"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Reports page views to our own cookieless counter. One "visit" per browser tab session. */
export function Tracker() {
  const pathname = usePathname();
  useEffect(() => {
    if (!pathname || /^\/(dashboard|api)/.test(pathname)) return;
    const send = (e: string, p?: string) => {
      const body = JSON.stringify({ e, p });
      if (!navigator.sendBeacon?.("/api/track", new Blob([body], { type: "application/json" }))) fetch("/api/track", { method: "POST", body, keepalive: true }).catch(() => null);
    };
    try {
      if (!sessionStorage.getItem("ns_bezoek")) {
        sessionStorage.setItem("ns_bezoek", "1");
        send("bezoek");
      }
    } catch {
      // sessionStorage blocked: count the page view only
    }
    send("pagina", pathname);
  }, [pathname]);
  return null;
}

/** For key moments, such as using the price calculator. */
export function trackEvent(e: "calculator" | "offerteformulier" | "socialformulier") {
  try {
    navigator.sendBeacon?.("/api/track", new Blob([JSON.stringify({ e })], { type: "application/json" }));
  } catch {
    // ignore
  }
}
