"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateVendorForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [rateRupees, setRateRupees] = useState(30);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/admin/vendors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        contactEmail,
        ratePaisePerStudent: Math.round(rateRupees * 100),
      }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }
    setName("");
    setContactEmail("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-ink-secondary">Vendor name</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-md border border-line px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-ink-secondary">Contact email</label>
        <input
          type="email"
          required
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          className="rounded-md border border-line px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-ink-secondary">Rate (₹/student/month)</label>
        <input
          type="number"
          min={1}
          required
          value={rateRupees}
          onChange={(e) => setRateRupees(Number(e.target.value))}
          className="w-32 rounded-md border border-line px-3 py-2 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-surface disabled:opacity-50"
      >
        {submitting ? "Creating…" : "Create vendor"}
      </button>
      {error ? <p className="w-full text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
