"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SubmitProjectForm({
  projectId,
  initialUrl,
  initialDescription,
}: {
  projectId: string;
  initialUrl?: string;
  initialDescription?: string;
}) {
  const router = useRouter();
  const [submissionUrl, setSubmissionUrl] = useState(initialUrl ?? "");
  const [description, setDescription] = useState(initialDescription ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    const res = await fetch(`/api/projects/${projectId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submissionUrl, description }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-2.5">
      <input
        type="url"
        value={submissionUrl}
        onChange={(e) => setSubmissionUrl(e.target.value)}
        placeholder="https://github.com/you/project or a live URL"
        className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-indigo-600 focus:outline-none"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        placeholder="What did you build, and what's the one hard part worth mentioning?"
        className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-indigo-600 focus:outline-none"
      />
      {error ? <p className="text-xs text-pillar-pink">{error}</p> : null}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting || !submissionUrl || description.length < 20}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-50"
      >
        {submitting ? "Submitting…" : initialUrl ? "Update submission" : "Submit"}
      </button>
    </div>
  );
}
