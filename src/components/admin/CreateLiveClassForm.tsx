"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateLiveClassForm({
  batches,
}: {
  batches?: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [batchId, setBatchId] = useState(batches?.[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/admin/live-classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...(batches ? { batchId } : {}),
        title,
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : "",
        durationMinutes,
      }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }
    setTitle("");
    setScheduledAt("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      {batches ? (
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-secondary">Batch</label>
          <select
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
            className="rounded-md border border-line px-3 py-2 text-sm"
          >
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      <div>
        <label className="mb-1 block text-xs font-medium text-ink-secondary">Title</label>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded-md border border-line px-3 py-2 text-sm"
          placeholder="e.g. Window functions, live walkthrough"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-ink-secondary">Starts at</label>
        <input
          required
          type="datetime-local"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
          className="rounded-md border border-line px-3 py-2 text-sm"
        />
      </div>
      <div className="w-32">
        <label className="mb-1 block text-xs font-medium text-ink-secondary">Duration (min)</label>
        <input
          type="number"
          min={15}
          value={durationMinutes}
          onChange={(e) => setDurationMinutes(Number(e.target.value) || 0)}
          className="w-full rounded-md border border-line px-3 py-2 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={submitting || (batches ? !batchId : false)}
        className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-surface disabled:opacity-50"
      >
        {submitting ? "Scheduling…" : "Schedule live class"}
      </button>
      {error ? <p className="w-full text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
