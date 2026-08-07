"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MarkCompleteButton({
  lectureId,
  initialCompleted,
}: {
  lectureId: string;
  initialCompleted: boolean;
}) {
  const router = useRouter();
  const [completed, setCompleted] = useState(initialCompleted);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    await fetch(`/api/lectures/${lectureId}/complete`, { method: "POST" });
    setLoading(false);
    setCompleted(true);
    router.refresh();
  }

  if (completed) {
    return (
      <span className="inline-flex items-center gap-2 rounded-lg bg-[#E7F7F0] px-4 py-2 text-sm font-medium text-[#059669]">
        ✓ Completed
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="rounded-lg bg-indigo-600 px-4 py-2 font-brand text-sm font-semibold text-white transition hover:bg-[#4338CA] disabled:opacity-50"
    >
      {loading ? "Saving…" : "Mark complete"}
    </button>
  );
}
