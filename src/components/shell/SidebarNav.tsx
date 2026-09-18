"use client";

import { usePathname } from "next/navigation";
import { Home, BookOpen, Code2, Award, Briefcase, type LucideIcon } from "lucide-react";
import ReadinessWidget from "@/components/shell/ReadinessWidget";
import MobileDrawer from "@/components/shell/MobileDrawer";
import type { Section } from "@/lib/tier";

type SubItem = { label: string; href: string; section?: Section; matchPrefix?: boolean };

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
  { label: "Learning paths", href: "/learn/paths", matchPrefix: true },
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
  { label: "Readiness report", href: "/career/report" },
  { label: "Campus drives", href: "/career" },
  { label: "Resume", href: "/career/resume" },
  { label: "Company question banks", href: "/career/questions" },
  { label: "Applications", href: "/career/applications" },
  { label: "Counselling", href: "/career/counselling" },
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
              <Icon className="h-4 w-4 shrink-0 text-ink-faintest" strokeWidth={1.5} />
              {item.label}
              <span className="ml-auto rounded-full bg-line-soft px-2 py-0.5 font-mono text-[10px] text-ink-faintest">
                {badge}
              </span>
            </>
          );
          if (locked) {
            return (
              // A plain <a>, not next/link's <Link>: see the note on the main
              // nav <a> below — same slow-page/lost-race navigation failure.
              <a
                key={item.href}
                href="/upgrade"
                onClick={onNavigate}
                className="clip-tab flex items-center gap-2.75 px-3 py-2.5 text-sm text-ink-faintest hover:bg-line-soft"
              >
                {content}
              </a>
            );
          }
          return (
            <span
              key={item.href}
              className="clip-tab flex cursor-default items-center gap-2.75 px-3 py-2.5 text-sm text-ink-faintest"
            >
              {content}
            </span>
          );
        }

        return (
          <div key={item.href}>
            {/* A plain <a>, not next/link's <Link>: this app's slower pages
                can lose the race against the still-in-flight prefetch and a
                client-side transition silently fails to navigate. A full
                navigation always renders correctly, so it's the reliable
                choice for every link in this sidebar. */}
            <a
              href={item.href}
              onClick={onNavigate}
              className={
                active
                  ? "clip-tab flex items-center gap-2.75 border-l-2 border-accent bg-accent-soft px-3 py-2.5 text-sm font-semibold text-accent"
                  : "clip-tab flex items-center gap-2.75 border-l-2 border-transparent px-3 py-2.5 text-sm text-ink-muted hover:bg-line-soft hover:text-ink"
              }
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={active ? 2 : 1.5} />
              {item.label}
            </a>

            {active && item.subItems ? (
              <div className="mt-1 flex flex-col gap-2.25 pl-9.75">
                {item.subItems.map((sub) => {
                  const subLocked = sub.section
                    ? !unlockedSections.includes(sub.section)
                    : false;
                  if (subLocked) {
                    return (
                      <a
                        key={sub.label}
                        href="/upgrade"
                        onClick={onNavigate}
                        className="flex items-center gap-1.5 text-[13.5px] text-ink-faintest hover:text-ink-faint"
                      >
                        {sub.label}
                        <span className="rounded-full bg-line-soft px-1.5 py-0.5 font-mono text-[9px] text-ink-faintest">
                          Upgrade
                        </span>
                      </a>
                    );
                  }
                  const subActive = sub.matchPrefix
                    ? pathname === sub.href || pathname.startsWith(`${sub.href}/`)
                    : pathname === sub.href;
                  return (
                    <a
                      key={sub.href}
                      href={sub.href}
                      onClick={onNavigate}
                      className={
                        subActive
                          ? "text-[13.5px] font-medium text-ink"
                          : "text-[13.5px] text-ink-muted hover:text-ink"
                      }
                    >
                      {sub.label}
                    </a>
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
