"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SelfSignupLinkForm({
  vendorId,
  initialEnabled,
  initialSignupSlug,
  studentBaseUrl,
}: {
  vendorId: string;
  initialEnabled: boolean;
  initialSignupSlug: string | null;
  studentBaseUrl: string;
}) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(initialEnabled);
  const [signupSlug, setSignupSlug] = useState(initialSignupSlug);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function toggle(next: boolean) {
    setSubmitting(true);
    setError(null);
    const res = await fetch(`/api/admin/vendors/${vendorId}/self-signup`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: next }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }
    setEnabled(data.selfSignupEnabled);
    setSignupSlug(data.signupSlug);
    router.refresh();
  }

  const link = signupSlug ? `${studentBaseUrl}/register?vendor=${signupSlug}` : null;

  async function copyLink() {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => toggle(!enabled)}
        disabled={submitting}
        className="rounded-md border border-line px-4 py-2 text-sm font-medium text-ink-secondary hover:bg-surface-sunk disabled:opacity-50"
      >
        {submitting ? "Saving…" : enabled ? "Disable self-signup" : "Enable self-signup"}
      </button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {enabled && link ? (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-line bg-surface-alt p-3 text-sm">
          <code className="break-all text-xs">{link}</code>
          <button
            type="button"
            onClick={copyLink}
            className="rounded-md border border-line px-2.5 py-1 text-xs font-medium hover:bg-surface-sunk"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
