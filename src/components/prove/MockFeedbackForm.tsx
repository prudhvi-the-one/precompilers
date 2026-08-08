"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
    <div className="space-y-4 rounded-xl border border-[#E6E6EF] bg-white p-6">
      <div>
        <p className="text-sm font-medium text-[#0F1020]">Score, out of 5</p>
        <div className="mt-1.5 flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setScore(n)}
              className={`h-9 flex-1 rounded-lg border text-sm font-semibold ${
                n <= score
                  ? "border-indigo-600 bg-[#F6F5FF] text-indigo-600"
                  : "border-[#E6E6EF] text-[#8A8AA0]"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-[#0F1020]">One-line quote</p>
        <input
          type="text"
          value={quote}
          onChange={(e) => setQuote(e.target.value)}
          placeholder="Good approach, but you went quiet for four minutes. Narrate."
          className="mt-1.5 w-full rounded-lg border border-[#E6E6EF] px-3 py-2 text-sm text-[#0F1020] focus:border-indigo-600 focus:outline-none"
        />
      </div>
      {error ? <p className="text-sm text-[#DB2777]">{error}</p> : null}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting || score === 0 || quote.trim().length === 0}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#4338CA] disabled:opacity-50"
      >
        {submitting ? "Submitting…" : "Submit feedback"}
      </button>
    </div>
  );
}
