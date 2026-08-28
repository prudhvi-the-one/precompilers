"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PublishDraftProblemButton({ problemId }: { problemId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function publish() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/admin/problems/${problemId}/publish`, { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Verification failed");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={publish}
        disabled={loading}
        className="rounded-md border border-line px-2.5 py-1 text-xs font-semibold text-ink-secondary hover:bg-surface-sunk disabled:opacity-50"
      >
        {loading ? "Verifying…" : "Try publish"}
      </button>
      {error ? <p className="max-w-40 text-right text-[10px] text-red-600">{error}</p> : null}
    </div>
  );
}
