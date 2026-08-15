"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateInstitutionForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [seatCount, setSeatCount] = useState(50);
  const [renewsAt, setRenewsAt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/admin/institutions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        seatCount,
        renewsAt: renewsAt ? new Date(renewsAt).toISOString() : undefined,
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
        <label className="mb-1 block text-xs font-medium text-ink-secondary">Institution name</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-md border border-line px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-ink-secondary">Seat count</label>
        <input
          type="number"
          min={1}
          required
          value={seatCount}
          onChange={(e) => setSeatCount(Number(e.target.value))}
          className="w-24 rounded-md border border-line px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-ink-secondary">Renews on</label>
        <input
          type="date"
          value={renewsAt}
          onChange={(e) => setRenewsAt(e.target.value)}
          className="rounded-md border border-line px-3 py-2 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-surface disabled:opacity-50"
      >
        {submitting ? "Creating…" : "Create institution"}
      </button>
      {error ? <p className="w-full text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
