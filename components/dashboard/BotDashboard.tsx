"use client";

import { Archive, ArrowLeft, BarChart3, Bot, CalendarDays, FileCode2, FileSignature, Gift, History, LayoutDashboard, Megaphone, Radio, Settings, ShieldAlert, Terminal, Ticket, Users } from "lucide-react";
import { AnnouncementsTab } from "@/components/dashboard/AnnouncementsTab";
import { AppointmentsTab } from "@/components/dashboard/AppointmentsTab";
import { SocialTab } from "@/components/dashboard/SocialTab";
import { ModerationTab } from "@/components/dashboard/ModerationTab";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ChangesTab } from "@/components/dashboard/ChangesTab";
import { CommunityTab } from "@/components/dashboard/CommunityTab";
import { LogsTab } from "@/components/dashboard/LogsTab";
import { MembersTab } from "@/components/dashboard/MembersTab";
import { OffersTab } from "@/components/dashboard/OffersTab";
import { StatsTab } from "@/components/dashboard/StatsTab";
import { TicketsTab } from "@/components/dashboard/TicketsTab";
import { ConsoleTab } from "@/components/dashboard/ConsoleTab";
import { OverviewTab } from "@/components/dashboard/OverviewTab";
import { PresenceTab } from "@/components/dashboard/PresenceTab";
import { ScriptsTab } from "@/components/dashboard/ScriptsTab";
import { SettingsTab } from "@/components/dashboard/SettingsTab";
import { SetupNotice } from "@/components/dashboard/ui";
import { cn } from "@/lib/utils";

const groups = [
  {
    label: "Algemeen",
    tabs: [
      { id: "overzicht", label: "Overzicht", icon: LayoutDashboard },
      { id: "statistieken", label: "Statistieken", icon: BarChart3 },
    ],
  },
  {
    label: "Klanten",
    tabs: [
      { id: "tickets", label: "Tickets", icon: Ticket },
      { id: "offertes", label: "Offertes & aanvragen", icon: FileSignature },
      { id: "social", label: "Social klanten", icon: Megaphone },
      { id: "leden", label: "Leden", icon: Users },
      { id: "afspraken", label: "Afspraken", icon: CalendarDays },
    ],
  },
  {
    label: "Community",
    tabs: [
      { id: "aankondigingen", label: "Aankondigingen", icon: Megaphone },
      { id: "moderatie", label: "Moderatie", icon: ShieldAlert },
      { id: "community", label: "Giveaways & verificatie", icon: Gift },
    ],
  },
  {
    label: "Bot",
    tabs: [
      { id: "instellingen", label: "Instellingen", icon: Settings },
      { id: "status", label: "Botstatus", icon: Radio },
      { id: "scripts", label: "Scripts", icon: FileCode2 },
      { id: "console", label: "Console", icon: Terminal },
      { id: "logs", label: "Logs & back-ups", icon: Archive },
      { id: "wijzigingen", label: "Wijzigingen", icon: History },
    ],
  },
] as const;

type Tab = (typeof groups)[number]["tabs"][number];
const tabs: readonly Tab[] = groups.flatMap((g): readonly Tab[] => g.tabs);

type TabId = (typeof tabs)[number]["id"];

export function BotDashboard({ configured, user }: { configured: boolean; user: { name: string; avatar: string | null } }) {
  const [tab, setTabState] = useState<TabId>("overzicht");

  // The open tab is kept in the address (#tickets), so a refresh or a bookmark opens the same tab.
  useEffect(() => {
    const fromHash = window.location.hash.slice(1);
    if (tabs.some((t) => t.id === fromHash)) setTabState(fromHash as TabId);
  }, []);
  const setTab = (id: TabId) => {
    setTabState(id);
    window.history.replaceState(null, "", `#${id}`);
  };

  return (
    <section className="pb-16 pt-32 sm:pt-36">
      <div className="container">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="grid size-14 place-items-center rounded-2xl border border-brand-500/30 bg-brand-600/15">
              <Bot className="size-7 text-brand-300" />
            </span>
            <div>
              <p className="text-sm text-zinc-400">Next Solutions Bot</p>
              <h1 className="text-3xl font-semibold">Bot-dashboard</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/klantportaal" className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white">
              <ArrowLeft className="size-4" /> Klantportaal
            </Link>
            <span className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm">
              {user.avatar ? (
                <Image src={user.avatar} alt="" width={24} height={24} className="size-6 rounded-full" />
              ) : (
                <span className="grid size-6 place-items-center rounded-full bg-brand-gradient text-xs font-semibold text-ink">{user.name.charAt(0)}</span>
              )}
              {user.name}
            </span>
          </div>
        </div>

        {!configured ? (
          <SetupNotice />
        ) : (
          <>
            <div className="mt-8 lg:grid lg:grid-cols-[220px_1fr] lg:gap-8">
              <nav className="lg:sticky lg:top-28 lg:self-start" aria-label="Dashboard-onderdelen">
                <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 lg:mx-0 lg:flex-col lg:gap-5 lg:overflow-visible lg:px-0">
                  {groups.map((group) => (
                    <div key={group.label} className="flex shrink-0 gap-2 lg:flex-col lg:gap-1">
                      <p className="hidden px-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 lg:block">{group.label}</p>
                      {group.tabs.map(({ id, label, icon: Icon }) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setTab(id)}
                          aria-current={tab === id ? "page" : undefined}
                          className={cn(
                            "inline-flex shrink-0 items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-medium transition lg:w-full lg:border-transparent lg:px-3 lg:py-2",
                            tab === id
                              ? "border-brand-500/50 bg-brand-600/20 text-white lg:border-brand-500/30"
                              : "border-white/10 bg-white/[0.02] text-zinc-400 hover:border-white/20 hover:text-white lg:bg-transparent lg:hover:bg-white/[0.04]",
                          )}
                        >
                          <Icon className="size-4" /> {label}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </nav>

            <div className="mt-6 min-w-0 lg:mt-0">
              {tab === "overzicht" && <OverviewTab />}
              {tab === "instellingen" && <SettingsTab />}
              {tab === "status" && <PresenceTab />}
              {tab === "scripts" && <ScriptsTab />}
              {tab === "console" && <ConsoleTab />}
              {tab === "wijzigingen" && <ChangesTab />}
              {tab === "statistieken" && <StatsTab />}
              {tab === "tickets" && <TicketsTab />}
              {tab === "offertes" && <OffersTab />}
              {tab === "leden" && <MembersTab />}
              {tab === "community" && <CommunityTab />}
              {tab === "logs" && <LogsTab />}
              {tab === "aankondigingen" && <AnnouncementsTab />}
              {tab === "moderatie" && <ModerationTab />}
              {tab === "afspraken" && <AppointmentsTab />}
              {tab === "social" && <SocialTab />}
            </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
