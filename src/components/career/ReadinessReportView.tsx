import ReadinessRing from "@/components/career/ReadinessRing";
import ReadinessPillarGrid from "@/components/career/ReadinessPillarGrid";
import type { PillarResult, ReadinessRecommendation } from "@/lib/readiness";

const TARGET_ROLE_LABELS: Record<string, string> = {
  SOFTWARE_ENGINEER: "Software engineer",
  DATA_ML_ENGINEER: "Data / ML engineer",
  FRONTEND_ENGINEER: "Frontend engineer",
  CLOUD_DEVOPS: "Cloud / DevOps",
  HIGHER_STUDIES: "Higher studies",
  NOT_SURE: "Not sure yet",
};

export { TARGET_ROLE_LABELS };

export default function ReadinessReportView({
  name,
  collegeLine,
  targetRole,
  overall,
  pillars,
  delta,
  activityLine,
  narrative,
  recommendations,
  mockNotes,
}: {
  name: string;
  collegeLine: string | null;
  targetRole: string | null;
  overall: number | null;
  pillars: PillarResult[];
  delta: number | null;
  activityLine: string;
  narrative: string | null;
  recommendations: ReadinessRecommendation[];
  mockNotes: string[] | null;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-line bg-surface p-5">
        <div className="flex flex-col items-start gap-5 sm:flex-row">
          <ReadinessRing score={overall} />
          <div className="flex-1">
            <p className="font-mono text-[10px] tracking-[0.1em] text-accent uppercase">
              Job readiness · Updated today
            </p>
            <h1 className="mt-1.5 font-brand text-xl font-bold text-ink">
              {name}
              {targetRole ? ` · ${TARGET_ROLE_LABELS[targetRole] ?? targetRole} track` : ""}
            </h1>
            {collegeLine ? <p className="mt-1 text-sm text-ink-muted">{collegeLine}</p> : null}
            {narrative ? <p className="mt-2 text-sm text-ink-secondary">{narrative}</p> : null}

            <div className="mt-3 flex flex-wrap gap-2">
              {delta !== null ? (
                <span className="rounded-full bg-success-soft px-2.5 py-1 text-xs font-semibold text-success">
                  {delta >= 0 ? "+" : ""}
                  {delta} in 90 days
                </span>
              ) : null}
              <span className="rounded-full bg-line-soft px-2.5 py-1 text-xs font-medium text-ink-secondary">
                {activityLine}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-line bg-surface p-5">
        <h2 className="mb-3 font-brand text-base font-bold text-ink">Readiness by pillar</h2>
        <ReadinessPillarGrid pillars={pillars} />
      </div>

      {recommendations.length > 0 ? (
        <div className="rounded-xl border border-line bg-surface p-5">
          <h2 className="font-brand text-base font-bold text-ink">
            To reach {Math.min(100, (overall ?? 0) + 13)} by campus season
          </h2>
          <div className="mt-3 space-y-2">
            {recommendations.map((rec) => (
              <div
                key={rec.action}
                className="flex items-center justify-between gap-4 rounded-lg border border-line-soft px-3.5 py-2.5"
              >
                <div className="flex items-center gap-3">
                  <span className="shrink-0 rounded-md bg-accent-soft px-2 py-1 font-mono text-xs font-semibold text-accent">
                    +{rec.pointDelta}
                  </span>
                  <span className="text-sm text-ink">{rec.action}</span>
                </div>
                <span className="shrink-0 text-xs text-ink-faint">{rec.timeEstimate}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {mockNotes && mockNotes.length > 0 ? (
        <div className="rounded-xl border border-line bg-surface p-5">
          <h2 className="font-brand text-base font-bold text-ink">Mock interview notes</h2>
          <div className="mt-3 space-y-2">
            {mockNotes.map((note, i) => (
              <p
                key={i}
                className="rounded-lg bg-surface-sunk px-3.5 py-2.5 text-sm text-ink-secondary"
              >
                {note}
              </p>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
