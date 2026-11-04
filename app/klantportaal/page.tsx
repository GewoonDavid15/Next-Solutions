import type { Metadata } from "next";
import { Dashboard } from "@/components/portal/Dashboard";
import { LoginCard } from "@/components/portal/LoginCard";
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

  const { projects, tickets } = getPortalData(session.id);
  return (
    <Dashboard
      user={{ name: session.globalName ?? session.username, avatar: avatarUrl(session), demo: session.demo }}
      projects={projects}
      tickets={tickets}
    />
  );
}
