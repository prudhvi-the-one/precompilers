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
  const [minCgpa, setMinCgpa] = useState("");
  const [maxBacklogs, setMaxBacklogs] = useState("");
  const [eligibleBranches, setEligibleBranches] = useState("");
  const [hiringBarScore, setHiringBarScore] = useState("");
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
        minCgpa: minCgpa ? Number(minCgpa) : undefined,
        maxBacklogs: maxBacklogs ? Number(maxBacklogs) : undefined,
        eligibleBranches: eligibleBranches
          ? eligibleBranches.split(",").map((b) => b.trim()).filter(Boolean)
          : undefined,
        hiringBarScore: hiringBarScore ? Number(hiringBarScore) : undefined,
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
    setMinCgpa("");
    setMaxBacklogs("");
    setEligibleBranches("");
    setHiringBarScore("");
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

      <div className="rounded-md border border-line-soft p-3">
        <p className="mb-2 text-xs font-semibold text-ink-secondary">
          Eligibility criteria (optional — leave blank for no restriction)
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-secondary">Min CGPA</label>
            <input
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={minCgpa}
              onChange={(e) => setMinCgpa(e.target.value)}
              className="w-full rounded-md border border-line px-3 py-2 text-sm"
              placeholder="e.g. 8.5"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-secondary">
              Max backlogs
            </label>
            <input
              type="number"
              min="0"
              value={maxBacklogs}
              onChange={(e) => setMaxBacklogs(e.target.value)}
              className="w-full rounded-md border border-line px-3 py-2 text-sm"
              placeholder="e.g. 0"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-secondary">
              Eligible branches (comma-separated)
            </label>
            <input
              value={eligibleBranches}
              onChange={(e) => setEligibleBranches(e.target.value)}
              className="w-full rounded-md border border-line px-3 py-2 text-sm"
              placeholder="e.g. CSE, IT, AIML"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-secondary">
              Typical hiring bar (readiness score)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={hiringBarScore}
              onChange={(e) => setHiringBarScore(e.target.value)}
              className="w-full rounded-md border border-line px-3 py-2 text-sm"
              placeholder="e.g. 65"
            />
          </div>
        </div>
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
