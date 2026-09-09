"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MarkInvoicedButton({
  vendorId,
  recordId,
}: {
  vendorId: string;
  recordId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function markInvoiced() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/admin/vendors/${vendorId}/billing/${recordId}/mark-invoiced`, {
      method: "POST",
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={markInvoiced}
        disabled={loading}
        className="rounded-md border border-line px-2.5 py-1 text-xs font-semibold text-ink-secondary hover:bg-surface-sunk disabled:opacity-50"
      >
        {loading ? "Saving…" : "Mark invoiced"}
      </button>
      {error ? <p className="max-w-40 text-right text-[10px] text-red-600">{error}</p> : null}
    </div>
  );
}
