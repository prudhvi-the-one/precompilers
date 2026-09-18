import type { PillarResult } from "@/lib/readiness";
import AngularBorder from "@/components/ui/AngularBorder";

function barColor(value: number): string {
  if (value < 40) return "var(--pillar-pink)";
  if (value < 60) return "var(--warn)";
  return "var(--accent)";
}

const WEAK_THRESHOLD = 40;

export default function ReadinessPillarGrid({ pillars }: { pillars: PillarResult[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {pillars.map((pillar) => {
        const weak = pillar.value !== null && pillar.value < WEAK_THRESHOLD;
        const tile = (
          <div className="bg-surface p-2.5">
            <div
              className={`flex min-h-4.25 flex-wrap items-start gap-1.5 text-xs ${
                weak ? "font-medium text-pillar-pink" : "text-ink-muted"
              }`}
            >
              {pillar.label}
              {pillar.provenance ? (
                <span
                  className={
                    pillar.provenance === "VERIFIED"
                      ? "clip-chip bg-success-soft px-1.5 py-0.5 font-mono text-[9px] font-semibold text-success"
                      : "clip-chip bg-line-soft px-1.5 py-0.5 font-mono text-[9px] font-semibold text-ink-faintest"
                  }
                >
                  {pillar.provenance}
                </span>
              ) : null}
            </div>
            <div className="mt-1.5 font-brand text-[22px] font-extrabold text-ink">
              {pillar.value !== null ? pillar.value : "—"}
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-line-soft">
              {pillar.value !== null ? (
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pillar.value}%`, backgroundColor: barColor(pillar.value) }}
                />
              ) : null}
            </div>
            <div className="mt-1 text-xs text-ink-faintest">
              {pillar.value !== null ? pillar.caption : "Not assessed"}
            </div>
          </div>
        );
        return weak ? (
          <AngularBorder key={pillar.label} color="var(--pillar-pink)">
            {tile}
          </AngularBorder>
        ) : (
          <div key={pillar.label} className="clip-panel bg-surface">
            {tile}
          </div>
        );
      })}
    </div>
  );
}
