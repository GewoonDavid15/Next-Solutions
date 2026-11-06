"use client";

import { BellRing, Download, Loader2, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";
import { useI18n } from "@/components/i18n/I18nProvider";
import { Button } from "@/components/ui/Button";

const texts = {
  nl: {
    title: "Pushmeldingen en app", intro: "Krijg een melding op je telefoon of computer bij een nieuw antwoord, een projectupdate of een offerte. Ook als de site dicht is.",
    on: "Meldingen aanzetten op dit apparaat", off: "Uitzetten op dit apparaat", test: "Stuur een testmelding", active: "Aan op dit apparaat", devices: "{n} apparaat/apparaten gekoppeld",
    unsupported: "Deze browser ondersteunt geen pushmeldingen.", ios: "Op iPhone en iPad: tik op Delen → Zet op beginscherm, open de app vanaf je beginscherm en zet daar de meldingen aan.",
    denied: "Je hebt meldingen geblokkeerd voor deze site. Zet ze aan in de instellingen van je browser.", install: "Installeer als app", android: "Download de Android-app (.apk)", androidNote: "Na het downloaden: open het bestand en sta installeren toe als je telefoon daarom vraagt.", installed: "Je gebruikt het portaal als app.", failed: "Er ging iets mis.", tested: "Testmelding verstuurd!",
  },
  en: {
    title: "Push notifications and app", intro: "Get a notification on your phone or computer for a new reply, a project update or a quote. Even when the site is closed.",
    on: "Turn on for this device", off: "Turn off for this device", test: "Send a test notification", active: "On for this device", devices: "{n} device(s) connected",
    unsupported: "This browser does not support push notifications.", ios: "On iPhone and iPad: tap Share → Add to Home Screen, open the app from your home screen and turn on notifications there.",
    denied: "You blocked notifications for this site. Turn them on in your browser settings.", install: "Install as app", android: "Download the Android app (.apk)", androidNote: "After downloading: open the file and allow the install if your phone asks for it.", installed: "You are using the portal as an app.", failed: "Something went wrong.", tested: "Test notification sent!",
  },
};

interface BeforeInstallPromptEvent extends Event { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }

const b64ToBytes = (b64: string) => {
  const s = atob(b64.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (b64.length % 4)) % 4));
  return Uint8Array.from(s, (c) => c.charCodeAt(0));
};

async function api(body?: unknown, endpoint?: string) {
  const res = body === undefined
    ? await fetch(`/api/portaal/push${endpoint ? `?endpoint=${encodeURIComponent(endpoint)}` : ""}`, { cache: "no-store" })
    : await fetch("/api/portaal/push", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = (await res.json().catch(() => ({}))) as { fout?: string; publiek?: string; aan?: boolean; apparaten?: number; ditApparaat?: boolean };
  if (!res.ok) throw new Error(data.fout ?? "");
  return data;
}

/** Turn push notifications on or off for this device, and install the portal as an app. */
export function PushSettings() {
  const { locale } = useI18n();
  const tx = texts[locale];
  const [support, setSupport] = useState<"checking" | "yes" | "no" | "ios">("checking");
  const [on, setOn] = useState(false);
  const [devices, setDevices] = useState(0);
  const [key, setKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [standalone, setStandalone] = useState(false);
  const [android, setAndroid] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone === true;
    setStandalone(isStandalone);
    setAndroid(/Android/i.test(navigator.userAgent));
    const onPrompt = (e: Event) => { e.preventDefault(); setInstallEvent(e as BeforeInstallPromptEvent); };
    window.addEventListener("beforeinstallprompt", onPrompt);

    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
      setSupport(ios && !isStandalone ? "ios" : "no");
    } else {
      setSupport("yes");
      (async () => {
        const reg = await navigator.serviceWorker.register("/sw.js");
        const sub = await reg.pushManager.getSubscription();
        const status = await api(undefined, sub?.endpoint).catch(() => null);
        if (!status) return;
        setKey(status.publiek ?? "");
        setDevices(status.apparaten ?? 0);
        setOn(Boolean(sub && status.ditApparaat));
      })().catch(() => {});
    }
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  async function turnOn() {
    setBusy(true); setMsg("");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") throw new Error(tx.denied);
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;
      const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToBytes(key) }));
      const r = await api({ actie: "aan", abonnement: sub.toJSON() });
      setOn(true);
      setDevices(r.apparaten ?? devices + 1);
    } catch (err) {
      setMsg((err as Error).message || tx.failed);
    } finally {
      setBusy(false);
    }
  }

  async function turnOff() {
    setBusy(true); setMsg("");
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      const r = await api({ actie: "uit", endpoint: sub?.endpoint });
      await sub?.unsubscribe();
      setOn(false);
      setDevices(r.apparaten ?? 0);
    } catch (err) {
      setMsg((err as Error).message || tx.failed);
    } finally {
      setBusy(false);
    }
  }

  async function test() {
    setBusy(true); setMsg("");
    try { await api({ actie: "test" }); setMsg(tx.tested); } catch (err) { setMsg((err as Error).message || tx.failed); } finally { setBusy(false); }
  }

  return (
    <div className="glass max-w-2xl rounded-3xl p-6">
      <h3 className="flex items-center gap-2 font-semibold"><BellRing className="size-5 text-brand-300" /> {tx.title}</h3>
      <p className="mt-1 text-sm text-zinc-400">{tx.intro}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {support === "checking" && <Loader2 className="size-4 animate-spin text-zinc-500" />}
        {support === "yes" && key && (on ? (
          <>
            <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-200">✓ {tx.active}</span>
            <Button size="sm" variant="secondary" disabled={busy} onClick={test}>{tx.test}</Button>
            <Button size="sm" variant="ghost" disabled={busy} onClick={turnOff}>{tx.off}</Button>
          </>
        ) : (
          <Button size="sm" disabled={busy} onClick={turnOn}>{busy ? <Loader2 className="animate-spin" /> : <BellRing />} {tx.on}</Button>
        ))}
        {support === "no" && <p className="text-sm text-zinc-400">{tx.unsupported}</p>}
        {support === "ios" && <p className="flex items-start gap-2 text-sm text-zinc-300"><Smartphone className="mt-0.5 size-4 shrink-0 text-brand-300" /> {tx.ios}</p>}
      </div>
      {devices > 0 && <p className="mt-2 text-xs text-zinc-500">{tx.devices.replace("{n}", String(devices))}</p>}
      {msg && <p role="status" className="mt-2 text-sm text-zinc-300">{msg}</p>}

      {(standalone || installEvent || android) && (
        <div className="mt-5 border-t border-white/10 pt-4">
          {standalone ? <p className="text-sm text-zinc-400">📱 {tx.installed}</p> : (
            <div className="flex flex-wrap gap-2">
              {android && <Button asChild size="sm"><a href="/downloads/next-solutions.apk" download><Smartphone /> {tx.android}</a></Button>}
              {installEvent && <Button size="sm" variant="secondary" onClick={async () => { await installEvent.prompt(); await installEvent.userChoice.catch(() => null); setInstallEvent(null); }}><Download /> {tx.install}</Button>}
            </div>
          )}
          {android && !standalone && <p className="mt-2 text-xs text-zinc-500">{tx.androidNote}</p>}
        </div>
      )}
    </div>
  );
}
