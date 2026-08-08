"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const DIMENSIONS = [
  { key: "correctness", label: "Correctness" },
  { key: "efficiency", label: "Efficiency" },
  { key: "readability", label: "Readability" },
] as const;

const HIRE_OPTIONS = [
  { value: "NOT_YET", label: "Not yet" },
  { value: "CLOSE", label: "Close" },
  { value: "YES", label: "Yes" },
] as const;

export default function PeerReviewForm({ submissionId }: { submissionId: string }) {
  const router = useRouter();
  const [scores, setScores] = useState<Record<string, number>>({
    correctness: 0,
    efficiency: 0,
    readability: 0,
  });
  const [wouldHire, setWouldHire] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const canSubmit =
    DIMENSIONS.every((d) => scores[d.key] > 0) &&
    wouldHire !== null &&
    comment.trim().length >= 40;

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    const res = await fetch(`/api/reviews/${submissionId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...scores, wouldHire, comment: comment.trim() }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }
    setResult(data.authorName);
  }

  if (result) {
    return (
      <div className="rounded-xl border border-[#E6E6EF] bg-white p-6 text-center">
        <p className="text-sm font-medium text-[#0F1020]">
          Review submitted — this was {result}&apos;s submission.
        </p>
        <button
          type="button"
          onClick={() => router.refresh()}
          className="mt-3 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-[#4338CA]"
        >
          Review the next one
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-brand text-base font-bold text-[#0F1020]">Your review</h3>
        <p className="text-xs text-[#8A8AA0]">Score each dimension, then leave one thing they should change.</p>
      </div>

      {DIMENSIONS.map((d) => (
        <div key={d.key}>
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-[#0F1020]">{d.label}</span>
            <span className="text-xs text-[#8A8AA0]">
              {scores[d.key] || "–"} / 5
            </span>
          </div>
          <div className="mt-1.5 flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setScores((s) => ({ ...s, [d.key]: n }))}
                className={`h-2 flex-1 rounded-full ${
                  n <= scores[d.key] ? "bg-indigo-600" : "bg-[#EDEDF3]"
                }`}
                aria-label={`${d.label} ${n} out of 5`}
              />
            ))}
          </div>
        </div>
      ))}

      <div>
        <p className="text-sm font-medium text-[#0F1020]">Would you hire on this?</p>
        <div className="mt-1.5 grid grid-cols-3 gap-2">
          {HIRE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setWouldHire(opt.value)}
              className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                wouldHire === opt.value
                  ? "border-indigo-600 bg-[#F6F5FF] text-indigo-600"
                  : "border-[#E6E6EF] text-[#55556B] hover:bg-[#FBFBFD]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-[#0F1020]">One thing to change</p>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="mt-1.5 w-full rounded-lg border border-[#E6E6EF] p-3 text-sm text-[#0F1020] focus:border-indigo-600 focus:outline-none"
          placeholder="Be specific — what would actually make this better?"
        />
        <p className="mt-1 text-xs text-[#9A9AAE]">
          {comment.trim().length}/40 characters minimum. Reviews are rated by the
          author — low-effort reviews stop being assigned.
        </p>
      </div>

      {error ? <p className="text-sm text-[#DB2777]">{error}</p> : null}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit || submitting}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#4338CA] disabled:opacity-50"
      >
        {submitting ? "Submitting…" : "Submit review"}
      </button>
    </div>
  );
}
