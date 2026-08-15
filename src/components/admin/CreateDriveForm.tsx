"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateDriveForm() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [driveDate, setDriveDate] = useState("");
  const [applyDeadline, setApplyDeadline] = useState("");
  const [applyUrl, setApplyUrl] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/admin/drives", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyName,
        roleTitle,
        driveDate: driveDate ? new Date(driveDate).toISOString() : "",
        applyDeadline: applyDeadline ? new Date(applyDeadline).toISOString() : undefined,
        applyUrl: applyUrl || undefined,
        location: location || undefined,
        description,
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
    setDriveDate("");
    setApplyDeadline("");
    setApplyUrl("");
    setLocation("");
    setDescription("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-secondary">Company</label>
          <input
            required
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full rounded-md border border-line px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-secondary">Role</label>
          <input
            required
            value={roleTitle}
            onChange={(e) => setRoleTitle(e.target.value)}
            className="w-full rounded-md border border-line px-3 py-2 text-sm"
            placeholder="e.g. SDE-1"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-secondary">Drive date</label>
          <input
            required
            type="datetime-local"
            value={driveDate}
            onChange={(e) => setDriveDate(e.target.value)}
            className="w-full rounded-md border border-line px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-secondary">
            Apply deadline (optional)
          </label>
          <input
            type="datetime-local"
            value={applyDeadline}
            onChange={(e) => setApplyDeadline(e.target.value)}
            className="w-full rounded-md border border-line px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-secondary">
            Apply URL (optional)
          </label>
          <input
            value={applyUrl}
            onChange={(e) => setApplyUrl(e.target.value)}
            className="w-full rounded-md border border-line px-3 py-2 text-sm"
            placeholder="https://..."
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-secondary">
            Location (optional)
          </label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full rounded-md border border-line px-3 py-2 text-sm"
            placeholder="e.g. Virtual, Bengaluru"
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-ink-secondary">Description</label>
        <textarea
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-line px-3 py-2 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-surface disabled:opacity-50"
      >
        {submitting ? "Adding…" : "Add drive"}
      </button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
