"use client";

/** Types, a data hook and formatting helpers for the management tabs of the bot dashboard. */

import { useCallback, useEffect, useRef, useState } from "react";
import { botApi } from "@/lib/dashboard";
import type { ClientApplication, ClientBug, ClientInvites, ClientOffer, ClientProject, ClientTicket, ClientTranscript } from "@/lib/live";

export interface Role {
  id: string;
  naam: string;
  kleur: string | null;
}

export interface OpenTicket {
  id: string;
  naam: string;
  afdeling: string;
  afdelingTitel: string;
  emoji: string;
  eigenaar: { id: string; naam: string; avatar: string | null };
  geclaimdDoor: string | null;
  geopend: number;
  laatsteActiviteit: number;
  laatsteVan: "klant" | "team" | "bot" | null;
  link: string;
}

export interface ClosedTicket {
  id: string;
  eigenaarId: string;
  eigenaarNaam: string | null;
  naam: string;
  afdeling: string;
  emoji: string;
  geopend: number;
  gesloten: number;
  berichten: number;
}

export interface TicketMessage {
  id: string;
  t: number;
  auteur: { id: string; naam: string; avatar: string | null; bot: boolean };
  via: "team" | "klant" | null;
  tekst: string;
  bijlagen: { naam: string; url: string; grootte: number; afbeelding: boolean }[];
}

export interface TicketThread {
  id: string;
  naam: string;
  afdeling: string;
  eigenaarId: string;
  berichten: TicketMessage[];
}

export interface AdminOffer {
  id: string;
  nummer: string;
  titel: string;
  prijs: string;
  klantId: string;
  kanaalId: string | null;
  status: "open" | "akkoord" | "betaald" | "ingetrokken" | "verlopen";
  statusNaam: string;
  statusEmoji: string;
  t: number;
  geldigTot: number;
  betaaldOp: number | null;
}

export interface Lead {
  id: string;
  afdeling: string;
  dienst: string;
  budget: string;
  planning: string;
  omschrijving: string;
  naam: string;
  email: string;
  discord: string;
  discordId: string | null;
  taal: "nl" | "en";
  status: "nieuw" | "opgepakt" | "ticket" | "spam";
  door?: string;
  ticketLink?: string;
  t: number;
}

export interface AdminGiveaway {
  id: string;
  prijs: string;
  omschrijving: string;
  aantal: number;
  rolId: string | null;
  minInvites: number;
  eindigt: number;
  status: "loopt" | "afgelopen";
  deelnemers: number;
  winnaars: string[];
  t: number;
}

export interface VerificationStats {
  actief: boolean;
  kanaalId: string | null;
  afgeschermd: number;
  geverifieerd: number;
  nietGeverifieerd: number;
  perDag: { geslaagd: Record<string, number>; mislukt: Record<string, number>; gestart: Record<string, number> };
}

export interface MemberSummary {
  id: string;
  naam: string;
  gebruikersnaam: string;
  avatar: string | null;
  bot: boolean;
  lidSinds: number | null;
  accountSinds: number;
  rollen: Role[];
}

export interface MemberDetail extends MemberSummary {
  timeoutTot: number | null;
  beheerder: boolean;
  binnenGekomen: { door: string | null; doorId: string | null; bron: string; code: string | null; nep: boolean; t: number } | null;
  invites: ClientInvites | null;
  tickets: ClientTicket[];
  transcripts: ClientTranscript[];
  offertes: ClientOffer[];
  projecten: ClientProject[];
  sollicitaties: ClientApplication[];
  bugs: ClientBug[];
  reviews: { sterren: number; tekst: string; t: number; bron: string }[];
}

export interface ManagedRole extends Role {
  leden: number;
  beheerbaar: boolean;
}

export interface DayStats {
  dag: string;
  joins: number;
  leaves: number;
  ticketsOpen: number;
  ticketsDicht: number;
  reviews: number;
  sterren: number | null;
  verificaties: number;
  offertes: number;
  betaald: number;
}

/** Loads a bot endpoint, optionally refreshing it on an interval. */
export function useBotData<T>(path: string | null, intervalMs?: number) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(Boolean(path));
  const current = useRef(path);
  current.current = path;

  const reload = useCallback(async () => {
    if (!path) return;
    try {
      const result = await botApi<T>("GET", path);
      if (current.current === path) {
        setData(result);
        setError("");
      }
    } catch (err) {
      if (current.current === path) setError((err as Error).message);
    } finally {
      if (current.current === path) setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    setLoading(Boolean(path));
    reload();
    if (!intervalMs || !path) return;
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") reload();
    }, intervalMs);
    return () => clearInterval(timer);
  }, [path, intervalMs, reload]);

  return { data, error, loading, reload, setData };
}

const rtf = new Intl.RelativeTimeFormat("nl", { numeric: "auto" });

export function timeAgo(t: number, now = Date.now()) {
  const s = Math.round((t - now) / 1000);
  const abs = Math.abs(s);
  if (abs < 60) return rtf.format(s, "second");
  if (abs < 3600) return rtf.format(Math.round(s / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(s / 3600), "hour");
  if (abs < 86400 * 30) return rtf.format(Math.round(s / 86400), "day");
  return new Date(t).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" });
}

export function dateTime(t: number) {
  return new Date(t).toLocaleString("nl-NL", { timeZone: "Europe/Amsterdam", dateStyle: "medium", timeStyle: "short" });
}

export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} kB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
