"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, GraduationCap, Users, Building2, GitBranch, type LucideIcon } from "lucide-react";

const PORTAL_LOGINS: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Student", href: "https://student.precompilers.com/login", icon: GraduationCap },
  { label: "Mentor", href: "https://mentor.precompilers.com/login", icon: Users },
  { label: "Institution", href: "https://admin.precompilers.com/login", icon: Building2 },
  { label: "Vendor", href: "https://vendor.precompilers.com/login", icon: GitBranch },
];

function dashboardHref(role: string): string {
  if (role === "STUDENT") return "https://student.precompilers.com/home";
  if (role === "MENTOR") return "https://mentor.precompilers.com/";
  if (role === "VENDOR_ADMIN") return "https://vendor.precompilers.com/";
  return "https://admin.precompilers.com/";
}

export default function LoginMenu() {
  const [role, setRole] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : { role: null }))
      .then((data) => setRole(data.role ?? null))
      .catch(() => {})
      .finally(() => setChecked(true));
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  if (!checked) {
    return null;
  }

  if (role) {
    return (
      <a
        href={dashboardHref(role)}
        className="hidden text-sm text-ink-secondary hover:text-ink sm:inline"
      >
        Go to dashboard
      </a>
    );
  }

  return (
    <div ref={containerRef} className="relative hidden sm:block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-1 text-sm font-medium text-ink-secondary hover:text-ink"
      >
        Log in
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          strokeWidth={2}
        />
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute top-full right-0 z-20 mt-2 w-44 rounded-xl border border-line bg-surface p-1.5 shadow-lg"
        >
          {PORTAL_LOGINS.map((portal) => (
            <a
              key={portal.href}
              href={portal.href}
              role="menuitem"
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-ink-secondary hover:bg-accent-soft hover:text-indigo-600"
            >
              <portal.icon className="h-4 w-4 shrink-0 text-ink-faint" strokeWidth={2} />
              {portal.label}
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}
