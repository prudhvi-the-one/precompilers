"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function FinalizeBillingForm({
  vendorId,
  defaultPeriodMonth,
}: {
  vendorId: string;
  defaultPeriodMonth: string;
}) {
  const router = useRouter();
  const [periodMonth, setPeriodMonth] = useState(defaultPeriodMonth);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch(`/api/admin/vendors/${vendorId}/billing/finalize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ periodMonth }),
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
          Month to finalize
        </label>
        <input
          type="month"
          required
          value={periodMonth}
          onChange={(e) => setPeriodMonth(e.target.value)}
          className="rounded-md border border-line px-3 py-2 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-surface disabled:opacity-50"
      >
        {submitting ? "Finalizing…" : "Finalize month"}
      </button>
      {error ? <p className="w-full text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
