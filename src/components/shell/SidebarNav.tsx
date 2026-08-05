"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Code2, Award, Briefcase } from "lucide-react";
import ReadinessWidget from "@/components/shell/ReadinessWidget";

const NAV_ITEMS = [
  { label: "Home", href: "/home", icon: Home },
  { label: "Learn", href: "/learn", icon: BookOpen, soon: true },
  { label: "Practice", href: "/practice", icon: Code2, soon: true },
  { label: "Prove", href: "/prove", icon: Award, soon: true },
  { label: "Career", href: "/career", icon: Briefcase, soon: true },
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex w-60 shrink-0 flex-col border-r border-[#EDEDF3] bg-[#FBFBFD] px-3.5 py-4.5">
      <div className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;

          if (item.soon) {
            return (
              <span
                key={item.href}
                className="flex cursor-default items-center gap-2.75 rounded-[9px] px-3 py-2.5 text-sm text-[#9A9AAE]"
              >
                <Icon
                  className="h-4 w-4 shrink-0"
                  strokeWidth={1.5}
                  color="#C6C6D4"
                />
                {item.label}
                <span className="ml-auto rounded-full bg-[#F2F2F7] px-2 py-0.5 font-mono text-[10px] text-[#9A9AAE]">
                  Soon
                </span>
              </span>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                active
                  ? "flex items-center gap-2.75 rounded-[9px] bg-[#F1F0FE] px-3 py-2.5 text-sm font-semibold text-[#4F46E5]"
                  : "flex items-center gap-2.75 rounded-[9px] px-3 py-2.5 text-sm text-[#55556B] hover:bg-[#F4F4F8]"
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

      <ReadinessWidget />
    </nav>
  );
}
