"use client";

import { useState } from "react";
import AngularBorder from "@/components/ui/AngularBorder";

export default function NotifyIfCriteriaChangeButton({
  driveId,
  initialWatching,
}: {
  driveId: string;
  initialWatching: boolean;
}) {
  const [watching, setWatching] = useState(initialWatching);
  const [submitting, setSubmitting] = useState(false);

  async function handleClick() {
    setSubmitting(true);
    const res = await fetch(`/api/drives/${driveId}/watch`, { method: "POST" });
    setSubmitting(false);
    if (res.ok) {
      setWatching(true);
    }
  }

  if (watching) {
    return <span className="text-xs font-medium text-ink-faint">We&apos;ll notify you</span>;
  }

  return (
    <AngularBorder clip="clip-btn" color="var(--line)" className="bg-surface" wrapperClassName="shrink-0">
      <button
        type="button"
        onClick={handleClick}
        disabled={submitting}
        className="px-3 py-1.5 text-xs font-semibold text-ink-secondary hover:bg-surface-sunk disabled:opacity-50"
      >
        {submitting ? "Saving…" : "Notify if criteria change"}
      </button>
    </AngularBorder>
  );
}
