"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type RowResult = { row: number; identifier: string; reason: string };
type Results = { created: number; skipped: RowResult[]; invalid: RowResult[] };

export default function BulkContentUploadForm({
  endpoint,
  extraFields,
  submitLabel = "Upload",
}: {
  endpoint: string;
  extraFields?: Record<string, string>;
  submitLabel?: string;
}) {
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
    for (const [key, value] of Object.entries(extraFields ?? {})) {
      formData.append(key, value);
    }

    const res = await fetch(endpoint, { method: "POST", body: formData });
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
          {submitting ? "Uploading…" : submitLabel}
        </button>
      </form>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {results ? (
        <div className="rounded-md border border-line bg-surface-alt p-3 text-sm">
          <p className="font-medium text-ink">
            {results.created} created
            {results.skipped.length ? `, ${results.skipped.length} skipped` : ""}
            {results.invalid.length ? `, ${results.invalid.length} invalid` : ""}.
          </p>
          {results.skipped.length || results.invalid.length ? (
            <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto text-xs text-ink-faint">
              {[...results.invalid, ...results.skipped].map((r, i) => (
                <li key={i}>
                  Row {r.row} ({r.identifier}): {r.reason}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
