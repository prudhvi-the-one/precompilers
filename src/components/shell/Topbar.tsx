import type { User } from "@prisma/client";
import Link from "next/link";
import { Search, Bell, Flame } from "lucide-react";
import Logo from "@/components/Logo";
import LogoutButton from "@/components/auth/LogoutButton";

function initials(name: string | null, email: string): string {
  if (name) {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }
  return email[0]?.toUpperCase() ?? "?";
}

export default function Topbar({ user }: { user: User }) {
  return (
    <header className="flex h-15 items-center border-b border-[#EDEDF3] bg-white px-6">
      <div className="w-54 shrink-0">
        <Logo size="compact" />
      </div>

      <div className="flex flex-1 justify-center px-4">
        <div className="relative w-full max-w-[420px]">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#9A9AAE]" />
          <input
            type="text"
            placeholder="Search lectures, problems, quizzes…"
            className="w-full rounded-lg border border-[#E6E6EF] bg-[#FAFAFC] py-2 pr-12 pl-9 text-sm text-[#2A2A38] placeholder:text-[#9A9AAE] focus:border-indigo-600/40 focus:outline-none"
          />
          <span className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md border border-[#E6E6EF] bg-white px-1.5 py-0.5 font-mono text-[10px] text-[#8A8AA0]">
            ⌘K
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-4">
        <button
          type="button"
          aria-label="Notifications"
          className="text-[#55556B] hover:text-[#0F1020]"
        >
          <Bell className="h-5 w-5" />
        </button>

        <span className="flex items-center gap-1 rounded-full bg-[#FEF6E7] px-2.5 py-1 font-mono text-[12.5px] text-[#B45309]">
          <Flame className="h-3.5 w-3.5" />
          0-day streak
        </span>

        <Link href="/profile" className="flex items-center gap-2">
          <span className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-full bg-indigo-600 font-brand text-[12px] font-semibold text-white">
            {initials(user.name, user.email)}
          </span>
          <span className="text-sm text-[#2A2A38]">
            {user.name ?? user.email}
          </span>
        </Link>

        <LogoutButton />
      </div>
    </header>
  );
}
