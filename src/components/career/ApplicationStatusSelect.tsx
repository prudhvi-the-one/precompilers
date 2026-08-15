"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUS_STYLE: Record<string, string> = {
  APPLIED: "bg-accent-soft text-indigo-600",
  INTERVIEWING: "bg-warn-soft text-warn",
  OFFER: "bg-success-soft text-success",
  REJECTED: "bg-error-soft text-error",
  WITHDRAWN: "bg-line-soft text-ink-muted",
};

export default function ApplicationStatusSelect({
  applicationId,
  status,
}: {
  applicationId: string;
  status: string;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState(status);
  const [updating, setUpdating] = useState(false);

  async function handleChange(next: string) {
    setUpdating(true);
    setCurrent(next);
    const res = await fetch(`/api/applications/${applicationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setUpdating(false);
    if (!res.ok) {
      setCurrent(status);
      return;
    }
    router.refresh();
  }

  return (
    <select
      value={current}
      disabled={updating}
      onChange={(e) => handleChange(e.target.value)}
      className={`rounded-full border-none px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[current]}`}
    >
      <option value="APPLIED">Applied</option>
      <option value="INTERVIEWING">Interviewing</option>
      <option value="OFFER">Offer</option>
      <option value="REJECTED">Rejected</option>
      <option value="WITHDRAWN">Withdrawn</option>
    </select>
  );
}
