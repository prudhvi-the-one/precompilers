"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function MockPoolStatus({
  initialRequestId,
  initialPaired,
}: {
  initialRequestId: string | null;
  initialPaired: boolean;
}) {
  const router = useRouter();
  const [requestId, setRequestId] = useState(initialRequestId);
  const [paired, setPaired] = useState(initialPaired);
  const [joining, setJoining] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!requestId || paired) return;
    pollRef.current = setInterval(async () => {
      const res = await fetch(`/api/mocks/requests/${requestId}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.paired) {
        setPaired(true);
        if (pollRef.current) clearInterval(pollRef.current);
      }
    }, 3000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [requestId, paired]);

  async function joinPool() {
    setJoining(true);
    const res = await fetch("/api/mocks/join", { method: "POST" });
    const data = await res.json();
    setJoining(false);
    setRequestId(data.requestId);
    setPaired(data.paired);
  }

  if (paired && requestId) {
    return (
      <button
        type="button"
        onClick={() => router.push(`/mock-room/${requestId}`)}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-hover"
      >
        Join your mock
      </button>
    );
  }

  if (requestId) {
    return (
      <p className="text-sm text-ink-faint">
        Waiting for a partner… you&apos;ll be paired automatically the moment
        someone else joins.
      </p>
    );
  }

  return (
    <button
      type="button"
      onClick={joinPool}
      disabled={joining}
      className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-50"
    >
      {joining ? "Joining…" : "Join the pool"}
    </button>
  );
}
