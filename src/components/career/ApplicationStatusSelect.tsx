"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUS_STYLE: Record<string, string> = {
  APPLIED: "bg-[#F1F0FE] text-indigo-600",
  INTERVIEWING: "bg-[#FEF6E7] text-[#B45309]",
  OFFER: "bg-[#E7F7F0] text-[#059669]",
  REJECTED: "bg-[#FDEBEC] text-[#DC2626]",
  WITHDRAWN: "bg-[#F2F2F7] text-[#55556B]",
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
