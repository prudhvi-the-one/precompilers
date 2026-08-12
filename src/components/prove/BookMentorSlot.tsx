"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const KIND_OPTIONS = [
  { value: "MOCK", label: "Mock" },
  { value: "HR_ROUND", label: "HR round" },
  { value: "COUNSELLING", label: "Counselling" },
] as const;

export default function BookMentorSlot({ slotId }: { slotId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function book(kind: string) {
    setLoading(kind);
    setError(null);
    const res = await fetch("/api/mentor-sessions/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slotId, kind }),
    });
    const data = await res.json();
    setLoading(null);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }
    router.push(`/mentor-session/${data.sessionId}`);
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-1.5">
        {KIND_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => book(opt.value)}
            disabled={loading !== null}
            className="rounded-md bg-indigo-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-[#4338CA] disabled:opacity-50"
          >
            {loading === opt.value ? "Booking…" : opt.label}
          </button>
        ))}
      </div>
      {error ? <p className="text-xs text-[#DB2777]">{error}</p> : null}
    </div>
  );
}
