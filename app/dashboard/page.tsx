import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { BotDashboard } from "@/components/dashboard/BotDashboard";
import { isBotApiConfigured, isDashboardOwner } from "@/lib/bot-api";
import { avatarUrl, getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Bot-dashboard",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/klantportaal");
  // Only the owner may see this page; for everyone else it simply does not exist.
  if (!isDashboardOwner(session)) notFound();

  return (
    <BotDashboard
      configured={isBotApiConfigured()}
      user={{ name: session.globalName ?? session.username, avatar: avatarUrl(session) }}
    />
  );
}
