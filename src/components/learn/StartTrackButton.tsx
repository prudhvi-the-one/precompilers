"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StartTrackButton({
  trackId,
  label = "Start track",
}: {
  trackId: string;
  label?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    await fetch("/api/tracks/enroll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trackId }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="text-sm font-semibold text-indigo-600 hover:underline disabled:opacity-50"
    >
      {loading ? "Starting…" : label}
    </button>
  );
}
