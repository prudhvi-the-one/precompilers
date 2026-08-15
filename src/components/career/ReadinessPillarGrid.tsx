import type { PillarResult } from "@/lib/readiness";

function barColor(value: number): string {
  if (value < 40) return "#DB2777";
  if (value < 60) return "#D97706";
  return "#4F46E5";
}

export default function ReadinessPillarGrid({ pillars }: { pillars: PillarResult[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {pillars.map((pillar) => (
        <div key={pillar.label}>
          <div className="flex min-h-4.25 flex-wrap items-start gap-1.5 text-xs text-[#55556B]">
            {pillar.label}
            {pillar.provenance ? (
              <span
                className={
                  pillar.provenance === "VERIFIED"
                    ? "rounded-full bg-[#E7F7F0] px-1.5 py-0.5 font-mono text-[9px] font-semibold text-[#059669]"
                    : "rounded-full bg-[#F2F2F7] px-1.5 py-0.5 font-mono text-[9px] font-semibold text-[#9A9AAE]"
                }
              >
                {pillar.provenance}
              </span>
            ) : null}
          </div>
          <div className="mt-1.5 h-1.5 rounded-full bg-[#EDEDF3]">
            {pillar.value !== null ? (
              <div
                className="h-full rounded-full"
                style={{ width: `${pillar.value}%`, backgroundColor: barColor(pillar.value) }}
              />
            ) : null}
          </div>
          <div className="mt-1 text-xs text-[#9A9AAE]">
            {pillar.value !== null ? `${pillar.value} · ${pillar.caption}` : "Not assessed"}
          </div>
        </div>
      ))}
    </div>
  );
}
