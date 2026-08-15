"use client";

import { useState } from "react";
import type { User } from "@prisma/client";
import Topbar from "@/components/shell/Topbar";
import SidebarNav from "@/components/shell/SidebarNav";
import type { Section } from "@/lib/tier";

export default function AppShell({
  user,
  overallReadiness,
  currentStreak,
  unlockedSections,
  children,
}: {
  user: User;
  overallReadiness: number | null;
  currentStreak: number;
  unlockedSections: Section[];
  children: React.ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-surface text-ink-secondary">
      <Topbar
        user={user}
        currentStreak={currentStreak}
        overallReadiness={overallReadiness}
        onMenuClick={() => setDrawerOpen(true)}
      />
      <div className="flex flex-1">
        <SidebarNav
          overallReadiness={overallReadiness}
          unlockedSections={unlockedSections}
          mobileOpen={drawerOpen}
          onMobileClose={() => setDrawerOpen(false)}
        />
        <main className="flex flex-1 flex-col gap-4.5 bg-surface-sunk px-4 py-5 sm:px-7 sm:py-6.5">
          {children}
        </main>
      </div>
    </div>
  );
}
