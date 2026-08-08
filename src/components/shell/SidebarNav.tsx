"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Code2, Award, Briefcase } from "lucide-react";
import ReadinessWidget from "@/components/shell/ReadinessWidget";

const LEARN_SUB_ITEMS = [
  { label: "Skill tracks", href: "/learn" },
  { label: "Lectures", href: "/learn/lectures" },
  { label: "Live classes", href: "/learn/live-classes" },
  { label: "Notes & resources", href: "/learn/notes" },
];

const PRACTICE_SUB_ITEMS = [
  { label: "Quizzes", href: "/practice/quizzes" },
  { label: "Aptitude papers", href: "/practice/aptitude" },
  { label: "History", href: "/practice/quizzes/history" },
  { label: "Coding problems", href: "/practice", soon: true },
];

const PROVE_SUB_ITEMS = [
  { label: "Projects", href: "/prove/projects" },
  { label: "Review queue", href: "/prove/review-queue" },
  { label: "Feedback received", href: "/prove/feedback-received" },
  { label: "Mock interviews", href: "/prove/mocks" },
  { label: "Group discussions", href: "/prove/group-discussions" },
];

const NAV_ITEMS = [
  { label: "Home", href: "/home", icon: Home },
  { label: "Learn", href: "/learn", icon: BookOpen, subItems: LEARN_SUB_ITEMS },
  { label: "Practice", href: "/practice", icon: Code2, subItems: PRACTICE_SUB_ITEMS },
  { label: "Prove", href: "/prove", icon: Award, subItems: PROVE_SUB_ITEMS },
  { label: "Career", href: "/career", icon: Briefcase, soon: true },
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex w-60 shrink-0 flex-col border-r border-[#EDEDF3] bg-[#FBFBFD] px-3.5 py-4.5">
      <div className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === "/home"
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
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
            <div key={item.href}>
              <Link
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

              {active && item.subItems ? (
                <div className="mt-1 flex flex-col gap-2.25 pl-9.75">
                  {item.subItems.map((sub) => {
                    if ("soon" in sub && sub.soon) {
                      return (
                        <span
                          key={sub.label}
                          className="flex cursor-default items-center gap-1.5 text-[13.5px] text-[#B8B8C7]"
                        >
                          {sub.label}
                          <span className="rounded-full bg-[#F2F2F7] px-1.5 py-0.5 font-mono text-[9px] text-[#9A9AAE]">
                            Soon
                          </span>
                        </span>
                      );
                    }
                    const subActive = pathname === sub.href;
                    return (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className={
                          subActive
                            ? "text-[13.5px] font-medium text-[#0F1020]"
                            : "text-[13.5px] text-[#6E6E86] hover:text-[#0F1020]"
                        }
                      >
                        {sub.label}
                      </Link>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <ReadinessWidget />
    </nav>
  );
}
