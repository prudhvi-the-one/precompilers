"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import Logo from "@/components/Logo";
import LoginMenu from "@/components/marketing/LoginMenu";
import ThemeToggle from "@/components/shell/ThemeToggle";
import MobileDrawer from "@/components/shell/MobileDrawer";

const links = [
  { href: "#gap", label: "The gap" },
  { href: "#how-we-close-it", label: "How it works" },
  { href: "#tracks", label: "Tracks" },
  { href: "#pricing", label: "Pricing" },
  { href: "#colleges", label: "For colleges" },
];

const PORTAL_LOGINS = [
  { label: "Student login", href: "https://student.precompilers.com/login" },
  { label: "Mentor login", href: "https://mentor.precompilers.com/login" },
  { label: "Institution login", href: "https://admin.precompilers.com/login" },
];

export default function Nav() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 h-17 border-b border-line-soft bg-surface/90 backdrop-blur-md">
        <nav className="mx-auto flex h-full max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-faint hover:bg-line-soft md:hidden"
            >
              <Menu className="h-5 w-5" strokeWidth={1.75} />
            </button>
            <Logo />
          </div>

          <div className="hidden items-center gap-8 text-sm text-ink-secondary md:flex">
            {links.map((link) => (
              <a key={link.href} href={link.href} className="hover:text-ink">
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-5">
            <ThemeToggle />
            <LoginMenu />
            <a
              href="https://student.precompilers.com/register"
              className="hidden rounded-lg bg-indigo-600 px-4 py-2 font-brand text-[13.5px] font-semibold text-white transition hover:bg-accent-hover sm:inline-block"
            >
              Sign up free
            </a>
          </div>
        </nav>
      </header>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-5 py-5">
          <Logo />
          <div className="mt-6 flex flex-col gap-1">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setDrawerOpen(false)}
                className="rounded-[9px] px-3 py-2.5 text-sm text-ink-secondary hover:bg-line-soft"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="mt-4 flex flex-col gap-1 border-t border-line-soft pt-4">
            {PORTAL_LOGINS.map((portal) => (
              <a
                key={portal.href}
                href={portal.href}
                className="rounded-[9px] px-3 py-2.5 text-sm text-ink-muted hover:bg-line-soft"
              >
                {portal.label}
              </a>
            ))}
          </div>

          <a
            href="https://student.precompilers.com/register"
            className="mt-6 rounded-lg bg-indigo-600 px-4 py-2.5 text-center font-brand text-[13.5px] font-semibold text-white transition hover:bg-accent-hover"
          >
            Sign up free
          </a>
        </div>
      </MobileDrawer>
    </>
  );
}
