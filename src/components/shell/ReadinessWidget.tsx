import Link from "next/link";

export default function ReadinessWidget({ score }: { score: number | null }) {
  const pct = score ?? 0;

  return (
    <div className="mt-auto rounded-[11px] border border-[#E6E6EF] bg-white p-4 text-center">
      <div
        className="mx-auto flex h-22 w-22 items-center justify-center rounded-full"
        style={{ background: `conic-gradient(#4F46E5 0 ${pct}%, #EDEDF3 ${pct}% 100%)` }}
      >
        <div className="flex h-17 w-17 items-center justify-center rounded-full bg-white">
          <span className="font-brand text-2xl font-extrabold text-[#0F1020]">
            {score !== null ? score : "—"}
          </span>
        </div>
      </div>
      <div className="mt-3 font-brand text-[13px] font-semibold text-[#0F1020]">
        Job readiness
      </div>
      <div className="mt-0.5 text-xs text-[#8A8AA0]">
        {score !== null ? "Overall score" : "Not assessed yet"}
      </div>
      <Link
        href="/career/report"
        className="mt-2 inline-block text-xs font-medium text-[#4F46E5] hover:underline"
      >
        See full report
      </Link>
    </div>
  );
}
