"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ApproveRejectActions({
  type,
  id,
}: {
  type: "quizzes" | "problems";
  id: string;
}) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function act(action: "approve" | "reject") {
    setSubmitting(true);
    setError(null);
    const res = await fetch(`/api/admin/content-review/${type}/${id}/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: action === "reject" ? JSON.stringify({ reason: reason.trim() }) : undefined,
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }
    router.push("/content-review");
    router.refresh();
  }

  return (
    <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => act("approve")}
          disabled={submitting}
          className="rounded-md bg-black px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          Approve
        </button>
        <button
          type="button"
          onClick={() => setShowReject((v) => !v)}
          disabled={submitting}
          className="rounded-md border border-red-300 px-4 py-2.5 text-sm font-semibold text-red-600 disabled:opacity-50"
        >
          Reject
        </button>
      </div>
      {showReject ? (
        <div className="space-y-2">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-gray-300 p-2.5 text-sm focus:border-black focus:outline-none"
            placeholder="Tell the mentor what to fix (at least 10 characters)."
          />
          <button
            type="button"
            onClick={() => act("reject")}
            disabled={submitting || reason.trim().length < 10}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Confirm reject
          </button>
        </div>
      ) : null}
    </div>
  );
}
