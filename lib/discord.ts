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
  live: boolean;
  name: string;
  online: number;
  memberCount: number | null;
  invite: string;
  status: "operational" | "degraded";
  members: Pick<DiscordWidgetMember, "id" | "username" | "status" | "avatar_url">[];
  channels: { id: string; name: string }[];
  updatedAt: string;
}

const FALLBACK: Omit<CommunityStats, "updatedAt" | "invite"> = {
  live: false,
  name: "Next Solutions",
  online: 312,
  memberCount: 4280,
  status: "operational",
  members: [],
  channels: [
    { id: "1", name: "📢・aankondigingen" },
    { id: "2", name: "💬・algemeen" },
    { id: "3", name: "🎮・game-dev" },
    { id: "4", name: "🤖・bot-support" },
    { id: "5", name: "🎨・showcase" },
  ],
};

/**
 * Reads the public server widget (Server Settings → Widget → Enable) and, when an invite
 * code is available, the approximate total member count. Falls back to demo data when
 * DISCORD_GUILD_ID is not configured or Discord is unreachable.
 */
export async function getCommunityStats(): Promise<CommunityStats> {
  const guildId = process.env.DISCORD_GUILD_ID;
  const configuredInvite = process.env.NEXT_PUBLIC_DISCORD_INVITE ?? "https://discord.gg/";
  const updatedAt = new Date().toISOString();

  if (!guildId) return { ...FALLBACK, invite: configuredInvite, updatedAt };

  try {
    const res = await fetch(`https://discord.com/api/guilds/${guildId}/widget.json`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error(`Widget request failed: ${res.status}`);
    const widget = (await res.json()) as DiscordWidget;

    const invite = widget.instant_invite ?? configuredInvite;
    const memberCount = await getApproximateMemberCount(invite);

    return {
      live: true,
      name: widget.name,
      online: widget.presence_count,
      memberCount,
      invite,
      status: "operational",
      members: widget.members.slice(0, 24).map(({ id, username, status, avatar_url }) => ({ id, username, status, avatar_url })),
      channels: [...widget.channels].sort((a, b) => a.position - b.position).slice(0, 8),
      updatedAt,
    };
  } catch {
    return { ...FALLBACK, invite: configuredInvite, status: "degraded", updatedAt };
  }
}

async function getApproximateMemberCount(invite: string): Promise<number | null> {
  const code = invite.split("/").filter(Boolean).pop();
  if (!code || code.includes(".")) return null;
  try {
    const res = await fetch(`https://discord.com/api/v10/invites/${code}?with_counts=true`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { approximate_member_count?: number };
    return data.approximate_member_count ?? null;
  } catch {
    return null;
  }
}
