"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const DIMENSIONS = [
  { key: "technical", label: "Technical" },
  { key: "communication", label: "Communication" },
  { key: "problemSolving", label: "Problem solving" },
  { key: "confidence", label: "Confidence" },
] as const;

const VERDICT_OPTIONS = [
  { value: "NOT_YET", label: "Not yet" },
  { value: "CLOSE", label: "Close" },
  { value: "YES", label: "Yes" },
] as const;

export default function ScorecardForm({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [scores, setScores] = useState<Record<string, number>>({
    technical: 0,
    communication: 0,
    problemSolving: 0,
    confidence: 0,
  });
  const [verdict, setVerdict] = useState<string | null>(null);
  const [writtenFeedback, setWrittenFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    DIMENSIONS.every((d) => scores[d.key] > 0) &&
    verdict !== null &&
    writtenFeedback.trim().length >= 20;

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    const res = await fetch(`/api/mentor-sessions/${sessionId}/scorecard`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...scores, verdict, writtenFeedback: writtenFeedback.trim() }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }
    router.push("/");
  }

  return (
    <div className="space-y-5">
      {DIMENSIONS.map((d) => (
        <div key={d.key}>
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-ink">{d.label}</span>
            <span className="text-xs text-ink-faint">{scores[d.key] || "–"} / 5</span>
          </div>
          <div className="mt-1.5 flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setScores((s) => ({ ...s, [d.key]: n }))}
                className={`h-2 flex-1 rounded-full ${n <= scores[d.key] ? "bg-ink" : "bg-line-soft"}`}
                aria-label={`${d.label} ${n} out of 5`}
              />
            ))}
          </div>
        </div>
      ))}

      <div>
        <p className="text-sm font-medium text-ink">Would you recommend hiring?</p>
        <div className="mt-1.5 grid grid-cols-3 gap-2">
          {VERDICT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setVerdict(opt.value)}
              className={`rounded-md border px-3 py-2 text-sm font-medium ${
                verdict === opt.value
                  ? "border-black bg-line-soft text-ink"
                  : "border-line text-ink-muted hover:bg-surface-sunk"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-ink">Feedback for the student</p>
        <textarea
          value={writtenFeedback}
          onChange={(e) => setWrittenFeedback(e.target.value)}
          rows={4}
          className="mt-1.5 w-full rounded-md border border-line p-3 text-sm text-ink focus:border-black focus:outline-none"
          placeholder="What went well, and what to work on next."
        />
        <p className="mt-1 text-xs text-ink-faintest">
          {writtenFeedback.trim().length}/20 characters minimum.
        </p>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit || submitting}
        className="w-full rounded-md bg-ink px-4 py-2.5 text-sm font-semibold text-surface disabled:opacity-50"
      >
        {submitting ? "Submitting…" : "Submit scorecard"}
      </button>
    </div>
  );
}
