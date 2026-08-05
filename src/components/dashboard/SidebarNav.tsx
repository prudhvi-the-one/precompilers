"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { label: string; href: string } | { label: string; soon: true };

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Profile", href: "/profile" },
  { label: "Practice", soon: true },
  { label: "Lectures", soon: true },
  { label: "Quizzes", soon: true },
  { label: "Mock Interviews", soon: true },
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex w-56 shrink-0 flex-col gap-0.5 bg-gray-50 p-4">
      {NAV_ITEMS.map((item) => {
        if ("soon" in item) {
          return (
            <span
              key={item.label}
              className="flex cursor-default items-center justify-between rounded-md px-3 py-2 text-sm text-gray-400"
            >
              {item.label}
              <span className="rounded-full bg-gray-200/70 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                Soon
              </span>
            </span>
          );
        }

        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-gray-600 hover:bg-white/60 hover:text-gray-900"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
