import "server-only";

export interface UptimeMonitor {
  name: string;
  up: boolean | null;
  uptime: { day: number | null; week: number | null; month: number | null };
}

/**
 * Monitors from UptimeRobot for the status page. Needs UPTIMEROBOT_API_KEY (a read-only key) in the
 * environment. Returns null when not configured or unreachable. Cached for five minutes.
 */
export async function getUptimeMonitors(): Promise<UptimeMonitor[] | null> {
  const key = process.env.UPTIMEROBOT_API_KEY?.trim();
  if (!key) return null;
  try {
    const res = await fetch("https://api.uptimerobot.com/v2/getMonitors", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", "Cache-Control": "no-cache" },
      body: new URLSearchParams({ api_key: key, format: "json", custom_uptime_ratios: "1-7-30" }),
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { stat: string; monitors?: { friendly_name: string; status: number; custom_uptime_ratio?: string }[] };
    if (json.stat !== "ok" || !json.monitors) return null;
    return json.monitors.map((m) => {
      const [day, week, month] = (m.custom_uptime_ratio ?? "").split("-").map((v) => (v ? Number(v) : null));
      // 2 = up, 8 = seems down, 9 = down, 0 = paused, 1 = not checked yet
      return { name: m.friendly_name, up: m.status === 2 ? true : m.status === 8 || m.status === 9 ? false : null, uptime: { day: day ?? null, week: week ?? null, month: month ?? null } };
    });
  } catch {
    return null;
  }
}
