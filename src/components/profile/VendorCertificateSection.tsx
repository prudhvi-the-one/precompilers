"use client";

import { useState } from "react";

export default function VendorCertificateSection({
  completionPercent,
  minCompletionPercent,
  initialIssued,
}: {
  completionPercent: number;
  minCompletionPercent: number | null;
  initialIssued: boolean;
}) {
  const [issued, setIssued] = useState(initialIssued);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleIssue() {
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/vendor/certificate", { method: "POST" });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }
    setIssued(true);
  }

  if (minCompletionPercent === null) {
    return null;
  }

  return (
    <div className="rounded-xl border border-line bg-surface p-6">
      <h2 className="mb-1 font-brand text-base font-bold text-ink">Completion certificate</h2>
      <p className="mb-3 text-xs text-ink-faint">
        {completionPercent}% complete · {minCompletionPercent}% required
      </p>
      {issued ? (
        <a
          href="/api/vendor/certificate/pdf"
          className="inline-block rounded-md bg-ink px-4 py-2 text-sm font-medium text-surface"
        >
          Download certificate
        </a>
      ) : completionPercent >= minCompletionPercent ? (
        <button
          type="button"
          onClick={handleIssue}
          disabled={submitting}
          className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-surface disabled:opacity-50"
        >
          {submitting ? "Issuing…" : "Issue certificate"}
        </button>
      ) : (
        <p className="text-sm text-ink-secondary">Keep going — not yet eligible.</p>
      )}
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
