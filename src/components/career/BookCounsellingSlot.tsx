"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BookCounsellingSlot({ slotId }: { slotId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function book() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/mentor-sessions/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slotId, kind: "COUNSELLING" }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }
    router.push(`/mentor-session/${data.sessionId}`);
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={book}
        disabled={loading}
        className="rounded-md bg-indigo-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-accent-hover disabled:opacity-50"
      >
        {loading ? "Booking…" : "Book"}
      </button>
      {error ? <p className="text-xs text-pillar-pink">{error}</p> : null}
    </div>
  );
}
