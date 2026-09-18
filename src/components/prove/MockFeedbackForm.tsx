"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AngularBorder from "@/components/ui/AngularBorder";

export default function MockFeedbackForm({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [score, setScore] = useState(0);
  const [quote, setQuote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    const res = await fetch(`/api/mocks/${requestId}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score, quote: quote.trim() }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }
    router.push("/prove/mocks");
    router.refresh();
  }

  return (
    <AngularBorder color="var(--line)" className="space-y-4 bg-surface p-6">
      <div>
        <p className="text-sm font-medium text-ink">Score, out of 5</p>
        <div className="mt-1.5 flex gap-1">
          {[1, 2, 3, 4, 5].map((n) =>
            n <= score ? (
              <button
                key={n}
                type="button"
                onClick={() => setScore(n)}
                className="clip-chip h-9 flex-1 bg-accent-soft text-sm font-semibold text-accent"
              >
                {n}
              </button>
            ) : (
              <AngularBorder key={n} clip="clip-chip" color="var(--line)" className="h-9 flex-1 bg-surface" wrapperClassName="flex-1">
                <button
                  type="button"
                  onClick={() => setScore(n)}
                  className="h-full w-full text-sm font-semibold text-ink-faint"
                >
                  {n}
                </button>
              </AngularBorder>
            )
          )}
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-ink">One-line quote</p>
        <input
          type="text"
          value={quote}
          onChange={(e) => setQuote(e.target.value)}
          placeholder="Good approach, but you went quiet for four minutes. Narrate."
          className="mt-1.5 w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-indigo-600 focus:outline-none"
        />
      </div>
      {error ? <p className="text-sm text-pillar-pink">{error}</p> : null}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting || score === 0 || quote.trim().length === 0}
        className="clip-btn w-full bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-50"
      >
        {submitting ? "Submitting…" : "Submit feedback"}
      </button>
    </AngularBorder>
  );
}
