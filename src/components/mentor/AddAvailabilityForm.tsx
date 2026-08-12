"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddAvailabilityForm() {
  const router = useRouter();
  const [startsAt, setStartsAt] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!startsAt) return;
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/mentor/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startsAt: new Date(startsAt).toISOString(),
        durationMinutes,
      }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }
    setStartsAt("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          Slot start
        </label>
        <input
          type="datetime-local"
          required
          value={startsAt}
          onChange={(e) => setStartsAt(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">
          Duration (min)
        </label>
        <select
          value={durationMinutes}
          onChange={(e) => setDurationMinutes(Number(e.target.value))}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          {[15, 30, 45, 60].map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {submitting ? "Adding…" : "Add slot"}
      </button>
      {error ? <p className="w-full text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
