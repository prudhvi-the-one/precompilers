"use client";

import { useEffect, useRef, useState } from "react";

const PORTAL_LOGINS = [
  { label: "Student", href: "https://student.precompilers.com/login" },
  { label: "Mentor", href: "https://mentor.precompilers.com/login" },
  { label: "Institution", href: "https://admin.precompilers.com/login" },
];

function dashboardHref(role: string): string {
  if (role === "STUDENT") return "https://student.precompilers.com/home";
  if (role === "MENTOR") return "https://mentor.precompilers.com/";
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
        className="text-sm text-ink-secondary hover:text-ink"
      >
        Log in ▾
      </button>
      {open ? (
        <div className="absolute right-0 top-full z-20 mt-2 w-44 rounded-lg border border-line bg-surface py-1.5 shadow-lg">
          {PORTAL_LOGINS.map((portal) => (
            <a
              key={portal.href}
              href={portal.href}
              className="block px-4 py-2 text-sm text-ink-secondary hover:bg-[#F6F5FF]"
            >
              {portal.label} login
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}
