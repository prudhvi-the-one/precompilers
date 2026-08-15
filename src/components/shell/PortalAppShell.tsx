"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import Logo from "@/components/Logo";
import LogoutButton from "@/components/auth/LogoutButton";
import ThemeToggle from "@/components/shell/ThemeToggle";
import PortalSidebarNav, { type PortalNavItem } from "@/components/shell/PortalSidebarNav";

export default function PortalAppShell({
  navItems,
  userLabel,
  children,
}: {
  navItems: PortalNavItem[];
  userLabel: string;
  children: React.ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <header className="flex h-15 items-center gap-3 border-b border-line bg-surface px-3 sm:px-6">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-faint hover:bg-line-soft lg:hidden"
        >
          <Menu className="h-5 w-5" strokeWidth={1.75} />
        </button>
        <Logo />
        <div className="ml-auto flex items-center gap-3 text-sm text-ink-muted">
          <ThemeToggle />
          <span className="hidden sm:inline">{userLabel}</span>
          <LogoutButton />
        </div>
      </header>
      <div className="flex flex-1">
        <PortalSidebarNav
          items={navItems}
          mobileOpen={drawerOpen}
          onMobileClose={() => setDrawerOpen(false)}
        />
        <main className="flex-1 bg-surface-sunk px-4 py-5 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
