"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import MobileDrawer from "@/components/shell/MobileDrawer";

export type PortalNavItem = { label: string; href: string; icon: LucideIcon };

function PortalNavList({
  items,
  onNavigate,
}: {
  items: PortalNavItem[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-1">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={
              active
                ? "flex items-center gap-2.75 rounded-[9px] bg-accent-soft px-3 py-2.5 text-sm font-semibold text-accent"
                : "flex items-center gap-2.75 rounded-[9px] px-3 py-2.5 text-sm text-ink-muted hover:bg-line-soft"
            }
          >
            <Icon
              className="h-4 w-4 shrink-0"
              strokeWidth={active ? 2 : 1.5}
              color={active ? "#4F46E5" : "#C6C6D4"}
            />
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}

export default function PortalSidebarNav({
  items,
  mobileOpen,
  onMobileClose,
}: {
  items: PortalNavItem[];
  mobileOpen: boolean;
  onMobileClose: () => void;
}) {
  return (
    <>
      <nav className="hidden w-60 shrink-0 flex-col border-r border-line-soft bg-surface-sunk px-3.5 py-4.5 lg:flex">
        <PortalNavList items={items} />
      </nav>

      <MobileDrawer open={mobileOpen} onClose={onMobileClose}>
        <nav className="flex flex-1 flex-col overflow-y-auto px-3.5 py-4.5">
          <PortalNavList items={items} onNavigate={onMobileClose} />
        </nav>
      </MobileDrawer>
    </>
  );
}
