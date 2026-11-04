"use client";

import { ArrowLeft, Bot, FileCode2, History, LayoutDashboard, Radio, Settings, Terminal } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ChangesTab } from "@/components/dashboard/ChangesTab";
import { ConsoleTab } from "@/components/dashboard/ConsoleTab";
import { OverviewTab } from "@/components/dashboard/OverviewTab";
import { PresenceTab } from "@/components/dashboard/PresenceTab";
import { ScriptsTab } from "@/components/dashboard/ScriptsTab";
import { SettingsTab } from "@/components/dashboard/SettingsTab";
import { SetupNotice } from "@/components/dashboard/ui";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "overzicht", label: "Overzicht", icon: LayoutDashboard },
  { id: "instellingen", label: "Instellingen", icon: Settings },
  { id: "status", label: "Botstatus", icon: Radio },
  { id: "scripts", label: "Scripts", icon: FileCode2 },
  { id: "console", label: "Console", icon: Terminal },
  { id: "wijzigingen", label: "Wijzigingen", icon: History },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function BotDashboard({ configured, user }: { configured: boolean; user: { name: string; avatar: string | null } }) {
  const [tab, setTab] = useState<TabId>("overzicht");

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
                <span className="grid size-6 place-items-center rounded-full bg-brand-gradient text-xs font-semibold">{user.name.charAt(0)}</span>
              )}
              {user.name}
            </span>
          </div>
        </div>

        {!configured ? (
          <SetupNotice />
        ) : (
          <>
            <nav className="mt-8 flex gap-2 overflow-x-auto pb-1" aria-label="Dashboard-onderdelen">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  aria-current={tab === id ? "page" : undefined}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-medium transition",
                    tab === id
                      ? "border-brand-500/50 bg-brand-600/20 text-white shadow-glow"
                      : "border-white/10 bg-white/[0.02] text-zinc-400 hover:border-white/20 hover:text-white",
                  )}
                >
                  <Icon className="size-4" /> {label}
                </button>
              ))}
            </nav>

            <div className="mt-6">
              {tab === "overzicht" && <OverviewTab />}
              {tab === "instellingen" && <SettingsTab />}
              {tab === "status" && <PresenceTab />}
              {tab === "scripts" && <ScriptsTab />}
              {tab === "console" && <ConsoleTab />}
              {tab === "wijzigingen" && <ChangesTab />}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
