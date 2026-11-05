import { ClientPortal } from "@/components/portal/ClientPortal";
import { Dashboard } from "@/components/portal/Dashboard";
import { LoginCard } from "@/components/portal/LoginCard";
import { getClientData, getTicketDepartments, isBotApiConfigured, isDashboardOwner } from "@/lib/bot-api";
import { getI18n, pageMetadata } from "@/lib/i18n/server";
import { getPortalData } from "@/lib/portal";
import { avatarUrl, getSession, isOAuthConfigured } from "@/lib/session";

export async function generateMetadata() {
  const { locale } = await getI18n();
  return locale === "en"
    ? pageMetadata("/klantportaal", "Client portal", "Log in with Discord and follow the status of your projects and tickets.", { robots: { index: false } })
    : pageMetadata("/klantportaal", "Klantportaal", "Log in met Discord en volg de status van je projecten en tickets.", { robots: { index: false } });
}

export default async function KlantportaalPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const [session, { error }, { locale }] = await Promise.all([getSession(), searchParams, getI18n()]);

  if (!session) return <LoginCard error={error} oauthEnabled={isOAuthConfigured()} locale={locale} />;

  const user = { name: session.globalName ?? session.username, avatar: avatarUrl(session) };

  // Real clients see their live data from the Discord bot
  if (!session.demo && isBotApiConfigured()) {
    const [data, departments] = await Promise.all([getClientData(session.id), getTicketDepartments()]);
    return <ClientPortal user={user} data={data} departments={departments} isOwner={isDashboardOwner(session)} locale={locale} />;
  }

  // Demo login (or bot not connected yet): example data
  const { projects, tickets } = getPortalData(session.id, locale);
  return <Dashboard user={{ ...user, demo: session.demo }} projects={projects} tickets={tickets} isOwner={isDashboardOwner(session)} />;
}
