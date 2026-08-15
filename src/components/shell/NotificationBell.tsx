"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";

type Notification = {
  id: string;
  title: string;
  body: string;
  link: string | null;
  readAt: string | null;
  createdAt: string;
};

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/notifications")
      .then((res) => (res.ok ? res.json() : { notifications: [] }))
      .then((data) => setNotifications(data.notifications ?? []))
      .catch(() => {});
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

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  async function markRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
    );
    await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
  }

  async function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })));
    await fetch("/api/notifications/read-all", { method: "PATCH" });
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => setOpen((v) => !v)}
        className="relative text-ink-muted hover:text-ink"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 ? (
          <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-600 px-1 font-mono text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-20 mt-2 w-80 rounded-xl border border-line bg-surface shadow-lg">
          <div className="flex items-center justify-between border-b border-line-soft px-4 py-3">
            <span className="font-brand text-sm font-bold text-ink">Notifications</span>
            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs font-medium text-indigo-600 hover:underline"
              >
                Mark all read
              </button>
            ) : null}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length ? (
              <div className="divide-y divide-line-soft">
                {notifications.map((n) => {
                  const inner = (
                    <div className={`px-4 py-3 ${n.readAt ? "" : "bg-accent-soft/40"}`}>
                      <p className="text-[13.5px] font-medium text-ink">{n.title}</p>
                      <p className="mt-0.5 text-[12.5px] text-ink-muted">{n.body}</p>
                      <p className="mt-1 text-[11px] text-ink-faintest">{timeAgo(n.createdAt)}</p>
                    </div>
                  );
                  return (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => markRead(n.id)}
                      className="block w-full text-left hover:bg-surface-sunk"
                    >
                      {inner}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="px-4 py-6 text-center text-sm text-ink-faint">No notifications yet.</p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
