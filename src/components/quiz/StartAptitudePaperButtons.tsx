"use client";

import { useRef, useState } from "react";

// Real <form> POSTs, not fetch()-then-navigate — see the route for why: a
// JS-triggered navigation after an awaited async gap (the camera check, or
// just the fetch itself) can lose the click's user-activation and get
// silently blocked by the browser. The proctored form's submit is
// intercepted once to run the camera check, then resubmitted for real.
export default function StartAptitudePaperButtons({ paperId }: { paperId: string }) {
  const proctoredFormRef = useRef<HTMLFormElement>(null);
  const cameraChecked = useRef(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleProctoredSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (cameraChecked.current) return;
    e.preventDefault();
    setError(null);
    setChecking(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((track) => track.stop());
    } catch {
      setError(
        "Camera permission is required for a proctored attempt. Allow camera access, or start in practice mode instead."
      );
      setChecking(false);
      return;
    }
    setChecking(false);
    cameraChecked.current = true;
    proctoredFormRef.current?.requestSubmit();
  }

  return (
    <div className="space-y-1.5">
      <div className="flex gap-2">
        <form
          ref={proctoredFormRef}
          action={`/api/quizzes/${paperId}/start`}
          method="POST"
          onSubmit={handleProctoredSubmit}
        >
          <input type="hidden" name="proctored" value="true" />
          <button
            type="submit"
            disabled={checking}
            className="shrink-0 rounded-lg bg-indigo-600 px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-accent-hover disabled:opacity-50"
          >
            {checking ? "Requesting camera…" : "Start proctored"}
          </button>
        </form>
        <form action={`/api/quizzes/${paperId}/start`} method="POST">
          <input type="hidden" name="proctored" value="false" />
          <button
            type="submit"
            className="shrink-0 rounded-lg border border-[#DDDDE7] px-3.5 py-2 text-[13px] font-semibold text-ink hover:bg-surface-sunk disabled:opacity-50"
          >
            Start practice
          </button>
        </form>
      </div>
      {error ? <p className="max-w-xs text-xs text-pillar-pink">{error}</p> : null}
    </div>
  );
}
