"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Account = {
  handle: string;
  verificationCode: string | null;
  trackingStatus: "UNVERIFIED" | "ACTIVE" | "BLOCKED_OR_PRIVATE";
};

const STATUS_LABEL: Record<Account["trackingStatus"], string> = {
  UNVERIFIED: "Not verified yet",
  ACTIVE: "Verified & tracking",
  BLOCKED_OR_PRIVATE: "Tracking lost — check your LeetCode privacy settings",
};

export default function ExternalJudgeLinkForm({
  initialAccount,
}: {
  initialAccount: Account | null;
}) {
  const router = useRouter();
  const [handle, setHandle] = useState(initialAccount?.handle ?? "");
  const [account, setAccount] = useState(initialAccount);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLink(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/profile/external-judge/link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform: "LEETCODE", handle }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }
    setAccount(data.account);
    router.refresh();
  }

  async function handleVerify() {
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/profile/external-judge/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform: "LEETCODE" }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }
    setAccount(data.account);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleLink} className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-secondary">
            LeetCode username
          </label>
          <input
            required
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            className="rounded-md border border-line px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-surface disabled:opacity-50"
        >
          {submitting ? "Saving…" : account ? "Update username" : "Link account"}
        </button>
      </form>

      {account?.verificationCode ? (
        <div className="rounded-md border border-line bg-surface-alt p-3 text-sm">
          <p className="text-ink-secondary">
            Paste this code into your LeetCode profile bio (Profile → Edit Profile → About Me),
            save it, then click Verify:
          </p>
          <code className="mt-1 block rounded bg-line-soft px-2 py-1 font-mono text-xs">
            {account.verificationCode}
          </code>
          <button
            type="button"
            onClick={handleVerify}
            disabled={submitting}
            className="mt-2 rounded-md border border-line px-3 py-1.5 text-xs font-medium disabled:opacity-50"
          >
            {submitting ? "Checking…" : "Verify"}
          </button>
        </div>
      ) : null}

      {account ? (
        <p className="text-xs text-ink-faint">Status: {STATUS_LABEL[account.trackingStatus]}</p>
      ) : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
