"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StartQuizButton({
  quizId,
  label = "Start quiz",
}: {
  quizId: string;
  label?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const res = await fetch(`/api/quizzes/${quizId}/start`, { method: "POST" });
    const data = (await res.json()) as { attemptId?: string };
    setLoading(false);
    if (data.attemptId) {
      router.push(`/quiz-attempt/${data.attemptId}`);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 font-brand text-[13px] font-semibold text-white hover:bg-[#4338CA] disabled:opacity-50"
    >
      {loading ? "Starting…" : label}
    </button>
  );
}
