"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Peer = { userId: string; displayName: string };
type Scores = { clarity: number; content: number; courtesy: number };

const DIMENSIONS: { key: keyof Scores; label: string }[] = [
  { key: "clarity", label: "Clarity" },
  { key: "content", label: "Content" },
  { key: "courtesy", label: "Courtesy" },
];

export default function GdRatingForm({
  sessionId,
  peers,
}: {
  sessionId: string;
  peers: Peer[];
}) {
  const router = useRouter();
  const [ratings, setRatings] = useState<Record<string, Scores>>(
    Object.fromEntries(peers.map((p) => [p.userId, { clarity: 0, content: 0, courtesy: 0 }]))
  );
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = peers.every((p) =>
    DIMENSIONS.every((d) => ratings[p.userId][d.key] > 0)
  );

  function setScore(userId: string, key: keyof Scores, value: number) {
    setRatings((prev) => ({ ...prev, [userId]: { ...prev[userId], [key]: value } }));
  }

  async function handleSubmit() {
    setSubmitting(true);
    await Promise.all(
      peers.map((p) =>
        fetch(`/api/gd/${sessionId}/rate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rateeId: p.userId, ...ratings[p.userId] }),
        })
      )
    );
    setSubmitting(false);
    router.push("/prove/group-discussions");
    router.refresh();
  }

  if (peers.length === 0) {
    return (
      <p className="text-sm text-ink-faint">
        No other participants stayed long enough to rate.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {peers.map((p) => (
        <div key={p.userId} className="rounded-xl border border-line bg-surface p-4">
          <p className="text-sm font-semibold text-ink">{p.displayName}</p>
          <div className="mt-2 space-y-2">
            {DIMENSIONS.map((d) => (
              <div key={d.key} className="flex items-center gap-3">
                <span className="w-16 text-xs text-ink-muted">{d.label}</span>
                <div className="flex flex-1 gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setScore(p.userId, d.key, n)}
                      className={`h-2 flex-1 rounded-full ${
                        n <= ratings[p.userId][d.key] ? "bg-indigo-600" : "bg-line-soft"
                      }`}
                      aria-label={`${d.label} ${n} out of 5 for ${p.displayName}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit || submitting}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-50"
      >
        {submitting ? "Submitting…" : "Submit ratings"}
      </button>
    </div>
  );
}
