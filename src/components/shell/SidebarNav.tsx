"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, Code2, Award, Briefcase, type LucideIcon } from "lucide-react";
import ReadinessWidget from "@/components/shell/ReadinessWidget";
import MobileDrawer from "@/components/shell/MobileDrawer";
import type { Section } from "@/lib/tier";

type SubItem = { label: string; href: string; section?: Section };

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  section?: Section;
  subItems?: SubItem[];
  soon?: boolean;
};

const LEARN_SUB_ITEMS: SubItem[] = [
  { label: "Skill tracks", href: "/learn" },
  { label: "Lectures", href: "/learn/lectures" },
  { label: "Live classes", href: "/learn/live-classes", section: "LIVE" },
  { label: "Notes & resources", href: "/learn/notes" },
];

const PRACTICE_SUB_ITEMS: SubItem[] = [
  { label: "Coding problems", href: "/practice/problems" },
  { label: "Quizzes", href: "/practice/quizzes" },
  { label: "Aptitude papers", href: "/practice/aptitude" },
  { label: "Quiz history", href: "/practice/quizzes/history" },
  { label: "Submission history", href: "/practice/problems/history" },
];

const PROVE_SUB_ITEMS: SubItem[] = [
  { label: "Projects", href: "/prove/projects" },
  { label: "Review queue", href: "/prove/review-queue" },
  { label: "Feedback received", href: "/prove/feedback-received" },
  { label: "Mock interviews", href: "/prove/mocks" },
  { label: "Group discussions", href: "/prove/group-discussions" },
];

const CAREER_SUB_ITEMS: SubItem[] = [
  { label: "Drives", href: "/career" },
  { label: "Applications", href: "/career/applications" },
  { label: "My report", href: "/career/report" },
  { label: "Resume", href: "/career/resume" },
  { label: "Question bank", href: "/career/questions" },
];

const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/home", icon: Home },
  { label: "Learn", href: "/learn", icon: BookOpen, section: "LEARN", subItems: LEARN_SUB_ITEMS },
  { label: "Practice", href: "/practice", icon: Code2, section: "PRACTICE", subItems: PRACTICE_SUB_ITEMS },
  { label: "Prove", href: "/prove", icon: Award, section: "PROVE", subItems: PROVE_SUB_ITEMS },
  { label: "Career", href: "/career", icon: Briefcase, section: "CAREER", subItems: CAREER_SUB_ITEMS },
];

function NavList({
  unlockedSections,
  onNavigate,
}: {
  unlockedSections: Section[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const active =
          item.href === "/home"
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        const locked = item.section ? !unlockedSections.includes(item.section) : false;

        if (item.soon || locked) {
          const badge = item.soon ? "Soon" : "Upgrade";
          const content = (
            <>
              <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} color="#C6C6D4" />
              {item.label}
              <span className="ml-auto rounded-full bg-line-soft px-2 py-0.5 font-mono text-[10px] text-ink-faintest">
                {badge}
              </span>
            </>
          );
          if (locked) {
            return (
              <Link
                key={item.href}
                href="/upgrade"
                onClick={onNavigate}
                className="flex items-center gap-2.75 rounded-[9px] px-3 py-2.5 text-sm text-ink-faintest hover:bg-line-soft"
              >
                {content}
              </Link>
            );
          }
          return (
            <span
              key={item.href}
              className="flex cursor-default items-center gap-2.75 rounded-[9px] px-3 py-2.5 text-sm text-ink-faintest"
            >
              {content}
            </span>
          );
        }

        return (
          <div key={item.href}>
            <Link
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

            {active && item.subItems ? (
              <div className="mt-1 flex flex-col gap-2.25 pl-9.75">
                {item.subItems.map((sub) => {
                  const subLocked = sub.section
                    ? !unlockedSections.includes(sub.section)
                    : false;
                  if (subLocked) {
                    return (
                      <Link
                        key={sub.label}
                        href="/upgrade"
                        onClick={onNavigate}
                        className="flex items-center gap-1.5 text-[13.5px] text-[#B8B8C7] hover:text-ink-faintest"
                      >
                        {sub.label}
                        <span className="rounded-full bg-line-soft px-1.5 py-0.5 font-mono text-[9px] text-ink-faintest">
                          Upgrade
                        </span>
                      </Link>
                    );
                  }
                  const subActive = pathname === sub.href;
                  return (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      onClick={onNavigate}
                      className={
                        subActive
                          ? "text-[13.5px] font-medium text-ink"
                          : "text-[13.5px] text-[#6E6E86] hover:text-ink"
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
  );
}

export default function SidebarNav({
  overallReadiness,
  unlockedSections,
  mobileOpen,
  onMobileClose,
}: {
  overallReadiness: number | null;
  unlockedSections: Section[];
  mobileOpen: boolean;
  onMobileClose: () => void;
}) {
  return (
    <>
      <nav className="hidden w-60 shrink-0 flex-col border-r border-line-soft bg-surface-sunk px-3.5 py-4.5 lg:flex">
        <NavList unlockedSections={unlockedSections} />
        <ReadinessWidget score={overallReadiness} />
      </nav>

      <MobileDrawer open={mobileOpen} onClose={onMobileClose}>
        <nav className="flex flex-1 flex-col overflow-y-auto px-3.5 py-4.5">
          <NavList unlockedSections={unlockedSections} onNavigate={onMobileClose} />
          <ReadinessWidget score={overallReadiness} />
        </nav>
      </MobileDrawer>
    </>
  );
}
