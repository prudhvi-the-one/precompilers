"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RetryTrackingButton({
  vendorId,
  userId,
}: {
  vendorId: string;
  userId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function retry() {
    setLoading(true);
    setMessage(null);
    const res = await fetch(`/api/admin/vendors/${vendorId}/students/${userId}/retry-tracking`, {
      method: "POST",
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setMessage(data.error ?? "Something went wrong");
      return;
    }
    if (data.trackingStatus === "ACTIVE") {
      router.refresh();
      return;
    }
    setMessage(data.error ?? "Still blocked");
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={retry}
        disabled={loading}
        className="rounded-md border border-line px-2.5 py-1 text-xs font-semibold text-ink-secondary hover:bg-surface-sunk disabled:opacity-50"
      >
        {loading ? "Retrying…" : "Retry tracking"}
      </button>
      {message ? <p className="max-w-40 text-right text-[10px] text-amber-700">{message}</p> : null}
    </div>
  );
}
