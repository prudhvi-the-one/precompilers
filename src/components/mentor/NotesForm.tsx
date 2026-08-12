"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NotesForm({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    const res = await fetch(`/api/mentor-sessions/${sessionId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: notes.trim() }),
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
    <div className="space-y-4">
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={6}
        className="w-full rounded-md border border-gray-300 p-3 text-sm text-gray-900 focus:border-black focus:outline-none"
        placeholder="Summary of the counselling conversation and next steps."
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!notes.trim() || submitting}
        className="w-full rounded-md bg-black px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
      >
        {submitting ? "Saving…" : "Save notes"}
      </button>
    </div>
  );
}
