"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PreferredMentorToggle({
  mentorId,
  initialPreferred,
}: {
  mentorId: string;
  initialPreferred: boolean;
}) {
  const router = useRouter();
  const [preferred, setPreferred] = useState(initialPreferred);
  const [submitting, setSubmitting] = useState(false);

  async function toggle() {
    const next = !preferred;
    setSubmitting(true);
    setPreferred(next);
    const res = await fetch("/api/admin/preferred-mentors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mentorId, preferred: next }),
    });
    setSubmitting(false);
    if (!res.ok) {
      setPreferred(!next);
      return;
    }
    router.refresh();
  }

  return (
    <label className="flex items-center gap-2 text-sm text-ink-secondary">
      <input type="checkbox" checked={preferred} disabled={submitting} onChange={toggle} />
      Preferred
    </label>
  );
}
