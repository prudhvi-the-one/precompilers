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
          <div className="flex min-h-4.25 flex-wrap items-start gap-1.5 text-xs text-ink-muted">
            {pillar.label}
            {pillar.provenance ? (
              <span
                className={
                  pillar.provenance === "VERIFIED"
                    ? "rounded-full bg-success-soft px-1.5 py-0.5 font-mono text-[9px] font-semibold text-success"
                    : "rounded-full bg-line-soft px-1.5 py-0.5 font-mono text-[9px] font-semibold text-ink-faintest"
                }
              >
                {pillar.provenance}
              </span>
            ) : null}
          </div>
          <div className="mt-1.5 h-1.5 rounded-full bg-line-soft">
            {pillar.value !== null ? (
              <div
                className="h-full rounded-full"
                style={{ width: `${pillar.value}%`, backgroundColor: barColor(pillar.value) }}
              />
            ) : null}
          </div>
          <div className="mt-1 text-xs text-ink-faintest">
            {pillar.value !== null ? `${pillar.value} · ${pillar.caption}` : "Not assessed"}
          </div>
        </div>
      ))}
    </div>
  );
}
