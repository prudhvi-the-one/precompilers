"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ShareReportControls({
  initialToken,
}: {
  initialToken: string | null;
}) {
  const router = useRouter();
  const [token, setToken] = useState(initialToken);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle(enabled: boolean) {
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/profile/report-share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }
    setToken(data.token);
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
    <div className="rounded-xl border border-[#E6E6EF] bg-white p-5">
      <h2 className="font-brand text-base font-bold text-[#0F1020]">Share your report</h2>
      <p className="mt-1 text-sm text-[#55556B]">
        Anyone with the link can view a live, read-only version of this report — no login
        required. Good for a recruiter or your placement cell.
      </p>

      {token ? (
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={shareUrl ?? ""}
              className="flex-1 rounded-md border border-[#E6E6EF] bg-[#FBFBFD] px-3 py-2 text-sm text-[#55556B]"
            />
            <button
              type="button"
              onClick={copyLink}
              className="rounded-md bg-[#0F1020] px-3 py-2 text-sm font-semibold text-white"
            >
              {copied ? "Copied!" : "Copy link"}
            </button>
          </div>
          <button
            type="button"
            onClick={() => toggle(false)}
            disabled={submitting}
            className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
          >
            Disable sharing
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => toggle(true)}
          disabled={submitting}
          className="mt-3 rounded-md bg-[#0F1020] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {submitting ? "Enabling…" : "Enable sharing"}
        </button>
      )}
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
