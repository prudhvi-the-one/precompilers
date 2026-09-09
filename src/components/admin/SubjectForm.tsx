"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SUBJECT_ICON_OPTIONS } from "@/lib/subjectIcons";

export default function SubjectForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [iconKey, setIconKey] = useState(SUBJECT_ICON_OPTIONS[0]);
  const [accentColor, setAccentColor] = useState("#4f46e5");
  const [order, setOrder] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/admin/subjects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, iconKey, accentColor, order, submit: true }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }
    setName("");
    setOrder(0);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-ink-secondary">Subject name</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-md border border-line px-3 py-2 text-sm"
          placeholder="e.g. SQL"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-ink-secondary">Icon</label>
        <select
          value={iconKey}
          onChange={(e) => setIconKey(e.target.value)}
          className="rounded-md border border-line px-3 py-2 text-sm"
        >
          {SUBJECT_ICON_OPTIONS.map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-ink-secondary">Accent color</label>
        <input
          type="color"
          value={accentColor}
          onChange={(e) => setAccentColor(e.target.value)}
          className="h-9 w-16 rounded-md border border-line"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-ink-secondary">Order</label>
        <input
          type="number"
          min={0}
          value={order}
          onChange={(e) => setOrder(Number(e.target.value))}
          className="w-20 rounded-md border border-line px-3 py-2 text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-surface disabled:opacity-50"
      >
        {submitting ? "Creating…" : "Create subject"}
      </button>
      {error ? <p className="w-full text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
