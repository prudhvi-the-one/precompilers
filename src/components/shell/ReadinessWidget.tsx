import Link from "next/link";

export default function ReadinessWidget({ score }: { score: number | null }) {
  const pct = score ?? 0;

  return (
    <div className="mt-auto rounded-[11px] border border-line bg-surface p-4 text-center">
      <div
        className="mx-auto flex h-22 w-22 items-center justify-center rounded-full"
        style={{ background: `conic-gradient(#4F46E5 0 ${pct}%, #EDEDF3 ${pct}% 100%)` }}
      >
        <div className="flex h-17 w-17 items-center justify-center rounded-full bg-surface">
          <span className="font-brand text-2xl font-extrabold text-ink">
            {score !== null ? score : "—"}
          </span>
        </div>
      </div>
      <div className="mt-3 font-brand text-[13px] font-semibold text-ink">
        Job readiness
      </div>
      <div className="mt-0.5 text-xs text-ink-faint">
        {score !== null ? "Overall score" : "Not assessed yet"}
      </div>
      <Link
        href="/career/report"
        className="mt-2 inline-block text-xs font-medium text-accent hover:underline"
      >
        See full report
      </Link>
    </div>
  );
}
