"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SUBJECT_ICON_OPTIONS } from "@/lib/subjectIcons";

export default function SubjectForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [iconKey, setIconKey] = useState(SUBJECT_ICON_OPTIONS[0]);
  const [accentColor, setAccentColor] = useState("#4f46e5");
  const [category, setCategory] = useState("");
  const [tagline, setTagline] = useState("");
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
      body: JSON.stringify({ name, iconKey, accentColor, category, tagline, order, submit: true }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }
    setName("");
    setCategory("");
    setTagline("");
    setOrder(0);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
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
          <label className="mb-1 block text-xs font-medium text-ink-secondary">Category</label>
          <input
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-md border border-line px-3 py-2 text-sm"
            placeholder="e.g. Databases"
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
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-ink-secondary">Tagline</label>
        <input
          required
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          className="w-full rounded-md border border-line px-3 py-2 text-sm"
          placeholder="Shown under the subject name on the Learning Paths card"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-surface disabled:opacity-50"
      >
        {submitting ? "Creating…" : "Create subject"}
      </button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </form>
  );
}
