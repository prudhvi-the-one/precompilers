"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProvisionUserForm({
  role,
  roleLabel,
  institutionOptions,
  batchOptions,
}: {
  role: string;
  roleLabel: string;
  institutionOptions?: { id: string; name: string }[];
  batchOptions?: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [institutionId, setInstitutionId] = useState(institutionOptions?.[0]?.id ?? "");
  const [facultyBatchId, setFacultyBatchId] = useState(batchOptions?.[0]?.id ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    const res = await fetch("/api/admin/provision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        name,
        role,
        institutionId: institutionOptions ? institutionId : undefined,
        facultyBatchId: batchOptions ? facultyBatchId : undefined,
      }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }
    setEmail("");
    setName("");
    setSuccess(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-ink-secondary">Name</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-md border border-line px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-ink-secondary">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-md border border-line px-3 py-2 text-sm"
        />
      </div>
      {institutionOptions ? (
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-secondary">Institution</label>
          <select
            value={institutionId}
            onChange={(e) => setInstitutionId(e.target.value)}
            className="rounded-md border border-line px-3 py-2 text-sm"
          >
            {institutionOptions.map((inst) => (
              <option key={inst.id} value={inst.id}>
                {inst.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      {batchOptions ? (
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-secondary">Batch</label>
          <select
            value={facultyBatchId}
            onChange={(e) => setFacultyBatchId(e.target.value)}
            className="rounded-md border border-line px-3 py-2 text-sm"
          >
            {batchOptions.map((batch) => (
              <option key={batch.id} value={batch.id}>
                {batch.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-surface disabled:opacity-50"
      >
        {submitting ? "Inviting…" : `Invite ${roleLabel}`}
      </button>
      {error ? <p className="w-full text-sm text-red-600">{error}</p> : null}
      {success ? (
        <p className="w-full text-sm text-success">
          Account created — they&apos;ll get an email to set their password.
        </p>
      ) : null}
    </form>
  );
}
