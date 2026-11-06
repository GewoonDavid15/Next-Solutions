import { botRequest, isBotApiConfigured } from "@/lib/bot-api";

/**
 * Calendar feed (.ics) with a member's appointments and content calendar. Calendar apps fetch this
 * link without being logged in, so it is protected by a long secret key the member can renew.
 */
interface Item { uid: string; start: number; eind: number; titel: string; omschrijving: string; link: string }

const SITE = "https://nextsolutionshq.nl";
const stamp = (t: number) => new Date(t).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
// RFC 5545: escape special characters and fold long lines at 75 octets
const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
function fold(line: string) {
  const out: string[] = [];
  let rest = line;
  while (Buffer.byteLength(rest) > 75) {
    let cut = 75;
    while (Buffer.byteLength(rest.slice(0, cut)) > 75) cut--;
    out.push(rest.slice(0, cut));
    rest = ` ${rest.slice(cut)}`;
  }
  out.push(rest);
  return out.join("\r\n");
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string; sleutel: string }> }) {
  const { id, sleutel: raw } = await params;
  const sleutel = raw.replace(/\.ics$/, "");
  if (!/^\d{17,20}$/.test(id) || !/^[A-Za-z0-9_-]{20,40}$/.test(sleutel) || !isBotApiConfigured()) return new Response("Niet gevonden.", { status: 404 });
  const res = await botRequest("GET", `/agenda?gebruiker=${id}&sleutel=${sleutel}`).catch(() => null);
  if (!res || res.status !== 200) return new Response(res?.status === 404 ? "Niet gevonden." : "Even niet beschikbaar.", { status: res?.status === 404 ? 404 : 503 });
  const items = ((res.data as { items?: Item[] }).items ?? []).filter((i) => Number.isFinite(i.start) && Number.isFinite(i.eind));
  const now = stamp(Date.now());
  const lines = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Next Solutions//Klantportaal//NL", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
    "X-WR-CALNAME:Next Solutions", "X-WR-TIMEZONE:Europe/Amsterdam", "REFRESH-INTERVAL;VALUE=DURATION:PT1H", "X-PUBLISHED-TTL:PT1H",
    ...items.flatMap((i) => [
      "BEGIN:VEVENT",
      `UID:${i.uid}@nextsolutionshq.nl`,
      `DTSTAMP:${now}`,
      `DTSTART:${stamp(i.start)}`,
      `DTEND:${stamp(Math.max(i.eind, i.start + 60_000))}`,
      `SUMMARY:${esc(i.titel)}`,
      `DESCRIPTION:${esc(`${i.omschrijving}\n\n${SITE}${i.link}`)}`,
      `URL:${SITE}${i.link}`,
      "END:VEVENT",
    ]),
    "END:VCALENDAR",
  ];
  return new Response(lines.map(fold).join("\r\n") + "\r\n", {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="next-solutions.ics"',
      "Cache-Control": "private, max-age=300",
      "X-Robots-Tag": "noindex",
    },
  });
}

export const dynamic = "force-dynamic";
