"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CertificateCriteriaForm({
  vendorId,
  defaultMinCompletionPercent,
}: {
  vendorId: string;
  defaultMinCompletionPercent: number;
}) {
  const router = useRouter();
  const [minCompletionPercent, setMinCompletionPercent] = useState(
    String(defaultMinCompletionPercent)
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch(`/api/admin/vendors/${vendorId}/certificate-criteria`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ minCompletionPercent: Number(minCompletionPercent) }),
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
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-ink-secondary">
          Minimum completion % for a certificate
        </label>
        <input
          type="number"
          min={1}
          max={100}
          required
          value={minCompletionPercent}
          onChange={(e) => setMinCompletionPercent(e.target.value)}
          className="w-32 rounded-md border border-line px-3 py-2 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-surface disabled:opacity-50"
      >
        {submitting ? "Saving…" : "Save"}
      </button>
      {error ? <p className="w-full text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
