"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StartAptitudePaperButtons({ paperId }: { paperId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"proctored" | "practice" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function start(proctored: boolean) {
    setError(null);
    setLoading(proctored ? "proctored" : "practice");

    if (proctored) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach((track) => track.stop());
      } catch {
        setError(
          "Camera permission is required for a proctored attempt. Allow camera access, or start in practice mode instead."
        );
        setLoading(null);
        return;
      }
    }

    const res = await fetch(`/api/quizzes/${paperId}/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ proctored }),
    });
    const data = (await res.json()) as { attemptId?: string };
    setLoading(null);
    if (data.attemptId) {
      router.push(`/quiz-attempt/${data.attemptId}`);
    }
  }

  return (
    <div className="space-y-1.5">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => start(true)}
          disabled={loading !== null}
          className="shrink-0 rounded-lg bg-indigo-600 px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-accent-hover disabled:opacity-50"
        >
          {loading === "proctored" ? "Starting…" : "Start proctored"}
        </button>
        <button
          type="button"
          onClick={() => start(false)}
          disabled={loading !== null}
          className="shrink-0 rounded-lg border border-[#DDDDE7] px-3.5 py-2 text-[13px] font-semibold text-ink hover:bg-surface-sunk disabled:opacity-50"
        >
          {loading === "practice" ? "Starting…" : "Start practice"}
        </button>
      </div>
      {error ? <p className="max-w-xs text-xs text-pillar-pink">{error}</p> : null}
    </div>
  );
}
