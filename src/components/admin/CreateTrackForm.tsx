"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ROLES = [
  { value: "SOFTWARE_ENGINEER", label: "Software engineer" },
  { value: "DATA_ML_ENGINEER", label: "Data / ML engineer" },
  { value: "FRONTEND_ENGINEER", label: "Frontend engineer" },
  { value: "CLOUD_DEVOPS", label: "Cloud / DevOps" },
  { value: "HIGHER_STUDIES", label: "Higher studies" },
  { value: "NOT_SURE", label: "Not sure yet" },
] as const;

export default function CreateTrackForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [requiredEntitlement, setRequiredEntitlement] = useState<
    "FREE" | "INDIVIDUAL" | "INSTITUTION"
  >("FREE");
  const [relevantRoles, setRelevantRoles] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleRole(role: string) {
    setRelevantRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/admin/tracks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, tagline, requiredEntitlement, relevantRoles }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }
    setName("");
    setTagline("");
    setRelevantRoles([]);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Track name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder="e.g. System design fundamentals"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">Required plan</label>
          <select
            value={requiredEntitlement}
            onChange={(e) => setRequiredEntitlement(e.target.value as typeof requiredEntitlement)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="FREE">Free</option>
            <option value="INDIVIDUAL">Individual</option>
            <option value="INSTITUTION">Institution</option>
          </select>
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">Tagline</label>
        <input
          required
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          placeholder="One line describing the track"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-700">Relevant roles</label>
        <div className="flex flex-wrap gap-2">
          {ROLES.map((role) => (
            <label
              key={role.value}
              className="flex items-center gap-1.5 rounded-md border border-gray-300 px-2.5 py-1.5 text-xs"
            >
              <input
                type="checkbox"
                checked={relevantRoles.includes(role.value)}
                onChange={() => toggleRole(role.value)}
              />
              {role.label}
            </label>
          ))}
        </div>
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {submitting ? "Creating…" : "Create track"}
      </button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
