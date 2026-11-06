export interface DiscordWidgetMember {
  id: string;
  username: string;
  status: "online" | "idle" | "dnd";
  avatar_url: string;
  game?: { name: string };
}

export interface DiscordWidget {
  id: string;
  name: string;
  instant_invite: string | null;
  presence_count: number;
  members: DiscordWidgetMember[];
  channels: { id: string; name: string; position: number }[];
}

export interface CommunityStats {
  /** true when the numbers come straight from Discord (widget or invite) */
  live: boolean;
  name: string;
  online: number | null;
  memberCount: number | null;
  invite: string;
  status: "operational" | "degraded";
  members: Pick<DiscordWidgetMember, "id" | "username" | "status" | "avatar_url">[];
  channels: { id: string; name: string }[];
  updatedAt: string;
}

interface InviteCounts {
  name: string | null;
  members: number | null;
  online: number | null;
}

/**
 * Real numbers only, never made-up ones. In order of preference:
 * 1. the public server widget (Server Settings → Widget → Enable): online count, members and channels;
 * 2. the invite link: approximate member and online counts (works without the widget);
 * 3. the member count the bot reports.
 * Anything that cannot be determined is null and shown as "—".
 */
export async function getCommunityStats(): Promise<CommunityStats> {
  const guildId = process.env.DISCORD_GUILD_ID;
  const configuredInvite = process.env.NEXT_PUBLIC_DISCORD_INVITE ?? "https://discord.gg/";
  const updatedAt = new Date().toISOString();

  if (guildId) {
    try {
      const res = await fetch(`https://discord.com/api/guilds/${guildId}/widget.json`, { next: { revalidate: 60 } });
      if (!res.ok) throw new Error(`Widget request failed: ${res.status}`);
      const widget = (await res.json()) as DiscordWidget;
      const invite = widget.instant_invite ?? configuredInvite;
      const counts = await getInviteCounts(invite);
      return {
        live: true,
        name: widget.name,
        online: widget.presence_count,
        memberCount: counts.members ?? (await botMemberCount()),
        invite,
        status: "operational",
        members: widget.members.slice(0, 24).map(({ id, username, status, avatar_url }) => ({ id, username, status, avatar_url })),
        channels: [...widget.channels].sort((a, b) => a.position - b.position).slice(0, 8),
        updatedAt,
      };
    } catch {
      // Widget turned off: use the invite counts below
    }
  }

  const counts = await getInviteCounts(configuredInvite);
  const memberCount = counts.members ?? (await botMemberCount());
  return {
    live: counts.members !== null,
    name: counts.name ?? "Next Solutions",
    online: counts.online,
    memberCount,
    invite: configuredInvite,
    status: counts.members !== null || memberCount !== null ? "operational" : "degraded",
    members: [],
    channels: [],
    updatedAt,
  };
}

async function botMemberCount(): Promise<number | null> {
  const { getPublicData } = await import("@/lib/bot-api");
  return (await getPublicData().catch(() => null))?.server?.leden ?? null;
}

async function getInviteCounts(invite: string): Promise<InviteCounts> {
  const code = invite.split("/").filter(Boolean).pop();
  if (!code || code.includes(".") || code === "VUL_IN") return { name: null, members: null, online: null };
  try {
    const res = await fetch(`https://discord.com/api/v10/invites/${code}?with_counts=true`, { next: { revalidate: 300 } });
    if (!res.ok) return { name: null, members: null, online: null };
    const data = (await res.json()) as { approximate_member_count?: number; approximate_presence_count?: number; guild?: { name?: string } };
    return { name: data.guild?.name ?? null, members: data.approximate_member_count ?? null, online: data.approximate_presence_count ?? null };
  } catch {
    return { name: null, members: null, online: null };
  }
}
