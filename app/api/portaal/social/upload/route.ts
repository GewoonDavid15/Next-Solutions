import type { NextRequest } from "next/server";
import { bot, portalRoute } from "@/lib/portal-route";

/**
 * Deliver content: a file (multipart, max 4 MB because of the hosting limit) or a link for bigger files.
 * The bot stores files in a private channel in Discord.
 */
export const POST = (request: NextRequest) =>
  portalRoute(request, true, async (s) => {
    const form = await request.formData().catch(() => null);
    if (!form) return { status: 400, data: { fout: "Ongeldige upload." } };
    const notitie = String(form.get("notitie") ?? "").slice(0, 500);
    const link = String(form.get("link") ?? "").trim();
    if (link) return bot("POST", "/klant/social/upload", { gebruiker: s.id, link, naam: String(form.get("naam") ?? "").slice(0, 120), notitie });

    const file = form.get("bestand");
    if (!(file instanceof File) || file.size === 0) return { status: 400, data: { fout: "Kies een bestand of vul een link in." } };
    if (file.size > 4 * 1024 * 1024) return { status: 413, data: { fout: "Maximaal 4 MB. Deel grotere bestanden (zoals video's) via een link, bijvoorbeeld Google Drive of WeTransfer." } };
    const data = Buffer.from(await file.arrayBuffer()).toString("base64");
    return bot("POST", "/klant/social/upload", { gebruiker: s.id, naam: file.name.slice(0, 100), type: file.type, data, notitie });
  });
