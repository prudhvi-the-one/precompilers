"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type RowResult = { row: number; email: string; reason: string };
type Results = { created: number; skipped: RowResult[]; invalid: RowResult[]; emailWarning?: string };

export default function BulkRosterUploadForm({ vendorId }: { vendorId: string }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Results | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setSubmitting(true);
    setError(null);
    setResults(null);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`/api/admin/vendors/${vendorId}/students/bulk`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }
    setResults(data);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-ink-faint">
        Upload an .xlsx or .csv file with columns: Name, Email, Branch, Roll Number, Phone
        (optional).
      </p>
      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
        <input
          type="file"
          accept=".xlsx,.csv"
          required
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="text-sm"
        />
        <button
          type="submit"
          disabled={submitting || !file}
          className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-surface disabled:opacity-50"
        >
          {submitting ? "Uploading…" : "Upload roster"}
        </button>
      </form>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {results ? (
        <div className="rounded-md border border-line bg-surface-alt p-3 text-sm">
          <p className="font-medium text-ink">
            {results.created} student{results.created === 1 ? "" : "s"} created
            {results.skipped.length ? `, ${results.skipped.length} skipped` : ""}
            {results.invalid.length ? `, ${results.invalid.length} invalid` : ""}.
          </p>
          {results.emailWarning ? (
            <p className="mt-1 text-amber-700">{results.emailWarning}</p>
          ) : null}
          {results.skipped.length || results.invalid.length ? (
            <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto text-xs text-ink-faint">
              {[...results.invalid, ...results.skipped].map((r, i) => (
                <li key={i}>
                  Row {r.row} ({r.email || "no email"}): {r.reason}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
