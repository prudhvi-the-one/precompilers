"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ApplicationForm() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [status, setStatus] = useState("APPLIED");
  const [deadline, setDeadline] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyName: companyName.trim(),
        roleTitle: roleTitle.trim(),
        status,
        deadline: deadline ? new Date(deadline).toISOString() : null,
        notes: notes.trim() || null,
      }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }
    setCompanyName("");
    setRoleTitle("");
    setStatus("APPLIED");
    setDeadline("");
    setNotes("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-line bg-surface p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-ink">Company</label>
          <input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="mt-1.5 w-full rounded-md border border-line p-2.5 text-sm focus:border-black focus:outline-none"
            placeholder="e.g. Zoho"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-ink">Role</label>
          <input
            value={roleTitle}
            onChange={(e) => setRoleTitle(e.target.value)}
            className="mt-1.5 w-full rounded-md border border-line p-2.5 text-sm focus:border-black focus:outline-none"
            placeholder="e.g. SDE Intern"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-ink">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-1.5 w-full rounded-md border border-line p-2.5 text-sm focus:border-black focus:outline-none"
          >
            <option value="APPLIED">Applied</option>
            <option value="INTERVIEWING">Interviewing</option>
            <option value="OFFER">Offer</option>
            <option value="REJECTED">Rejected</option>
            <option value="WITHDRAWN">Withdrawn</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-ink">Deadline (optional)</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="mt-1.5 w-full rounded-md border border-line p-2.5 text-sm focus:border-black focus:outline-none"
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-ink">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="mt-1.5 w-full rounded-md border border-line p-2.5 text-sm focus:border-black focus:outline-none"
          placeholder="Referral, recruiter contact, round details…"
        />
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={submitting || !companyName.trim() || !roleTitle.trim()}
        className="rounded-md bg-ink px-4 py-2.5 text-sm font-semibold text-surface disabled:opacity-50"
      >
        {submitting ? "Logging…" : "Log application"}
      </button>
    </form>
  );
}
