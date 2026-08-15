import type { User } from "@prisma/client";
import Link from "next/link";
import { Search, Flame, Menu } from "lucide-react";
import Logo from "@/components/Logo";
import LogoutButton from "@/components/auth/LogoutButton";
import NotificationBell from "@/components/shell/NotificationBell";
import ThemeToggle from "@/components/shell/ThemeToggle";
import { initialsFromName } from "@/lib/avatar";

export default function Topbar({
  user,
  currentStreak,
  overallReadiness,
  onMenuClick,
}: {
  user: User;
  currentStreak: number;
  overallReadiness: number | null;
  onMenuClick: () => void;
}) {
  const readinessPct = overallReadiness ?? 0;
  return (
    <header className="flex h-15 items-center gap-2 border-b border-line-soft bg-surface px-3 sm:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open menu"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-faint hover:bg-line-soft lg:hidden"
      >
        <Menu className="h-5 w-5" strokeWidth={1.75} />
      </button>

      <div className="w-auto shrink-0 lg:w-54">
        <Logo size="compact" />
      </div>

      <div className="hidden flex-1 justify-center px-4 sm:flex">
        <div className="relative w-full max-w-[420px]">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-faintest" />
          <input
            type="text"
            placeholder="Search lectures, problems, quizzes…"
            className="w-full rounded-lg border border-line bg-surface-sunk py-2 pr-12 pl-9 text-sm text-ink-secondary placeholder:text-ink-faintest focus:border-indigo-600/40 focus:outline-none"
          />
          <span className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md border border-line bg-surface px-1.5 py-0.5 font-mono text-[10px] text-ink-faint">
            ⌘K
          </span>
        </div>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:ml-0 sm:gap-4">
        <ThemeToggle />
        <NotificationBell />

        <span className="hidden items-center gap-1 rounded-full bg-warn-soft px-2.5 py-1 font-mono text-[12.5px] text-warn sm:flex">
          <Flame className="h-3.5 w-3.5" />
          {currentStreak}-day streak
        </span>

        <Link href="/profile" className="flex items-center gap-2">
          <span
            title={overallReadiness !== null ? `Job readiness: ${overallReadiness}` : undefined}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
            style={{
              background: `conic-gradient(var(--accent) 0 ${readinessPct}%, var(--line-soft) ${readinessPct}% 100%)`,
            }}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 font-brand text-[12px] font-semibold text-white">
              {initialsFromName(user.name, user.email)}
            </span>
          </span>
          <span className="hidden text-sm text-ink-secondary lg:inline">
            {user.name ?? user.email}
          </span>
        </Link>

        <LogoutButton />
      </div>
    </header>
  );
}
