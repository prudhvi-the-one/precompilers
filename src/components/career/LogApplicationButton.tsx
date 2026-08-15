"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LogApplicationButton({ driveId }: { driveId: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function handleClick() {
    setSubmitting(true);
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ driveId, companyName: "", roleTitle: "" }),
    });
    setSubmitting(false);
    if (res.ok) {
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={submitting}
      className="shrink-0 rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-ink-secondary hover:bg-surface-sunk disabled:opacity-50"
    >
      {submitting ? "Logging…" : "Log application"}
    </button>
  );
}
