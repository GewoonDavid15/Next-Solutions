import type { Metadata } from "next";
import { ClientPortal } from "@/components/portal/ClientPortal";
import { Dashboard } from "@/components/portal/Dashboard";
import { LoginCard } from "@/components/portal/LoginCard";
import { getClientData, isBotApiConfigured, isDashboardOwner } from "@/lib/bot-api";
import { getPortalData } from "@/lib/portal";
import { avatarUrl, getSession, isOAuthConfigured } from "@/lib/session";

export const metadata: Metadata = {
  title: "Klantportaal",
  description: "Log in met Discord en volg de status van je projecten en tickets.",
  robots: { index: false },
};

export default async function KlantportaalPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const [session, { error }] = await Promise.all([getSession(), searchParams]);

  if (!session) return <LoginCard error={error} oauthEnabled={isOAuthConfigured()} />;

  const user = { name: session.globalName ?? session.username, avatar: avatarUrl(session) };

  // Real clients see their live data from the Discord bot
  if (!session.demo && isBotApiConfigured()) {
    const data = await getClientData(session.id);
    return <ClientPortal user={user} data={data} isOwner={isDashboardOwner(session)} />;
  }

  // Demo login (or bot not connected yet): example data
  const { projects, tickets } = getPortalData(session.id);
  return <Dashboard user={{ ...user, demo: session.demo }} projects={projects} tickets={tickets} isOwner={isDashboardOwner(session)} />;
}
