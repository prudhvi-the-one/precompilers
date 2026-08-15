"use client";

import { useState } from "react";

const inputClass =
  "w-full rounded-md border border-line px-3 py-2 text-sm focus:border-ink-faint focus:outline-none focus:ring-1 focus:ring-line";
const labelClass = "mb-1 block text-sm font-medium text-ink-secondary";

const currentYear = new Date().getFullYear();
const GRAD_YEARS = Array.from({ length: 7 }, (_, i) => currentYear - 1 + i);

export default function ProfileForm({
  initialName,
  initialCollege,
  initialBranch,
  initialGradYear,
  initialCgpa,
  initialBacklogCount,
  initialPhoneNumber,
  initialWhatsappOptIn,
}: {
  initialName: string;
  initialCollege: string;
  initialBranch: string;
  initialGradYear: number | null;
  initialCgpa: number | null;
  initialBacklogCount: number | null;
  initialPhoneNumber: string;
  initialWhatsappOptIn: boolean;
}) {
  const [name, setName] = useState(initialName);
  const [college, setCollege] = useState(initialCollege);
  const [branch, setBranch] = useState(initialBranch);
  const [gradYear, setGradYear] = useState(
    initialGradYear ? String(initialGradYear) : ""
  );
  const [cgpa, setCgpa] = useState(initialCgpa !== null ? String(initialCgpa) : "");
  const [backlogCount, setBacklogCount] = useState(
    initialBacklogCount !== null ? String(initialBacklogCount) : ""
  );
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber);
  const [whatsappOptIn, setWhatsappOptIn] = useState(initialWhatsappOptIn);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError(null);

    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        college,
        branch,
        gradYear: gradYear ? Number(gradYear) : null,
        cgpa: cgpa ? Number(cgpa) : null,
        backlogCount: backlogCount ? Number(backlogCount) : null,
        phoneNumber: phoneNumber.trim() || null,
        whatsappOptIn,
      }),
    });
    const data = await res.json();

    if (!res.ok) {
      setStatus("error");
      setError(data.error ?? "Something went wrong");
      return;
    }
    setStatus("saved");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClass} htmlFor="name">
          Full name
        </label>
        <input
          id="name"
          type="text"
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <label className={labelClass} htmlFor="college">
          College
        </label>
        <input
          id="college"
          type="text"
          className={inputClass}
          value={college}
          onChange={(e) => setCollege(e.target.value)}
        />
      </div>
      <div>
        <label className={labelClass} htmlFor="branch">
          Branch
        </label>
        <input
          id="branch"
          type="text"
          className={inputClass}
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
        />
      </div>
      <div>
        <label className={labelClass} htmlFor="gradYear">
          Graduation year
        </label>
        <select
          id="gradYear"
          className={inputClass}
          value={gradYear}
          onChange={(e) => setGradYear(e.target.value)}
        >
          <option value="">Select year</option>
          {GRAD_YEARS.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass} htmlFor="cgpa">
            CGPA
          </label>
          <input
            id="cgpa"
            type="number"
            min="0"
            max="10"
            step="0.01"
            className={inputClass}
            value={cgpa}
            onChange={(e) => setCgpa(e.target.value)}
            placeholder="e.g. 8.1"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="backlogCount">
            Backlogs
          </label>
          <input
            id="backlogCount"
            type="number"
            min="0"
            step="1"
            className={inputClass}
            value={backlogCount}
            onChange={(e) => setBacklogCount(e.target.value)}
            placeholder="0"
          />
        </div>
      </div>
      <div>
        <label className={labelClass} htmlFor="phoneNumber">
          Phone number
        </label>
        <input
          id="phoneNumber"
          type="tel"
          className={inputClass}
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="+91XXXXXXXXXX"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          id="whatsappOptIn"
          type="checkbox"
          checked={whatsappOptIn}
          onChange={(e) => setWhatsappOptIn(e.target.checked)}
        />
        <label htmlFor="whatsappOptIn" className="text-sm text-ink-secondary">
          Send me WhatsApp notifications
        </label>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {status === "saved" ? (
        <p className="text-sm text-green-700">Saved.</p>
      ) : null}
      <button
        type="submit"
        disabled={status === "saving"}
        className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-surface disabled:opacity-50"
      >
        {status === "saving" ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
