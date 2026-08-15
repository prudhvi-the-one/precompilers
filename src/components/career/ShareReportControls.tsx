"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ShareReportControls({
  initialToken,
  initialShowCollege,
  initialShowMockNotes,
}: {
  initialToken: string | null;
  initialShowCollege: boolean;
  initialShowMockNotes: boolean;
}) {
  const router = useRouter();
  const [token, setToken] = useState(initialToken);
  const [showCollege, setShowCollege] = useState(initialShowCollege);
  const [showMockNotes, setShowMockNotes] = useState(initialShowMockNotes);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function update(payload: { enabled: boolean; showCollege?: boolean; showMockNotes?: boolean }) {
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/profile/report-share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }
    setToken(data.token);
    setShowCollege(data.showCollege);
    setShowMockNotes(data.showMockNotes);
    router.refresh();
  }

  const shareUrl =
    token && typeof window !== "undefined" ? `${window.location.origin}/report/${token}` : null;

  async function copyLink() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-xl border border-line bg-surface p-5">
      <h2 className="font-brand text-base font-bold text-ink">Sharing</h2>
      <p className="mt-1 text-sm text-ink-muted">
        Anyone with the link can view a live, read-only version of this report — no login
        required. Good for a recruiter or your placement cell.
      </p>

      <div className="mt-4 space-y-3">
        <ToggleRow
          label="Public link"
          checked={token !== null}
          disabled={submitting}
          onChange={(checked) => update({ enabled: checked, showCollege, showMockNotes })}
        />
        <ToggleRow
          label="Show my college"
          checked={showCollege}
          disabled={submitting || token === null}
          onChange={(checked) => update({ enabled: true, showCollege: checked })}
        />
        <ToggleRow
          label="Show mock interview notes"
          checked={showMockNotes}
          disabled={submitting || token === null}
          onChange={(checked) => update({ enabled: true, showMockNotes: checked })}
        />
      </div>

      {token ? (
        <div className="mt-4 flex items-center gap-2">
          <input
            readOnly
            value={shareUrl ?? ""}
            className="flex-1 rounded-md border border-line bg-surface-sunk px-3 py-2 font-mono text-sm text-ink-muted"
          />
          <button
            type="button"
            onClick={copyLink}
            className="rounded-md bg-ink px-3 py-2 text-sm font-semibold text-surface"
          >
            {copied ? "Copied!" : "Copy link"}
          </button>
        </div>
      ) : null}

      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}

      <p className="mt-4 text-xs text-ink-faint">
        Your placement cell sees this report if your college holds a licence. Individual
        submissions are never shared.
      </p>
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-ink-secondary">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition disabled:opacity-50 ${
          checked ? "bg-accent" : "bg-line-soft"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
            checked ? "left-5.5" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}
