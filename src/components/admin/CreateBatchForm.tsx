"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateBatchForm({
  tracks,
  institutions,
}: {
  tracks: { id: string; name: string }[];
  institutions: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [trackId, setTrackId] = useState(tracks[0]?.id ?? "");
  const [institutionId, setInstitutionId] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/admin/batches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        trackId,
        institutionId: institutionId || undefined,
        startsAt: startsAt ? new Date(startsAt).toISOString() : new Date().toISOString(),
      }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }
    setName("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-ink-secondary">Batch name</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-md border border-line px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-ink-secondary">Track</label>
        <select
          value={trackId}
          onChange={(e) => setTrackId(e.target.value)}
          className="rounded-md border border-line px-3 py-2 text-sm"
        >
          {tracks.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-ink-secondary">Institution (optional)</label>
        <select
          value={institutionId}
          onChange={(e) => setInstitutionId(e.target.value)}
          className="rounded-md border border-line px-3 py-2 text-sm"
        >
          <option value="">None</option>
          {institutions.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-ink-secondary">Starts</label>
        <input
          type="date"
          value={startsAt}
          onChange={(e) => setStartsAt(e.target.value)}
          className="rounded-md border border-line px-3 py-2 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={submitting || !trackId}
        className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-surface disabled:opacity-50"
      >
        {submitting ? "Creating…" : "Create batch"}
      </button>
      {error ? <p className="w-full text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
