import Link from "next/link";
import type { Application, Drive } from "@prisma/client";
import { avatarColor, initialsFromName } from "@/lib/avatar";
import type { EligibilityResult } from "@/lib/driveEligibility";
import type { DriveReadinessResult } from "@/lib/readiness";
import LogApplicationButton from "@/components/career/LogApplicationButton";
import NotifyIfCriteriaChangeButton from "@/components/career/NotifyIfCriteriaChangeButton";

const STATUS_STYLE: Record<string, string> = {
  APPLIED: "bg-accent-soft text-indigo-600",
  INTERVIEWING: "bg-warn-soft text-warn",
  OFFER: "bg-success-soft text-success",
  REJECTED: "bg-error-soft text-error",
  WITHDRAWN: "bg-line-soft text-ink-muted",
};

const STATUS_LABEL: Record<string, string> = {
  APPLIED: "Applied",
  INTERVIEWING: "Interviewing",
  OFFER: "Offer",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function DriveCard({
  drive,
  eligibility,
  application,
  driveReadiness,
  batchAppliedCount,
  isWatching,
}: {
  drive: Drive;
  eligibility: EligibilityResult;
  application: Application | undefined;
  driveReadiness: DriveReadinessResult | null;
  batchAppliedCount: number | null;
  isWatching: boolean;
}) {
  const applied = Boolean(application);

  if (!eligibility.eligible && !applied) {
    return (
      <div className="flex items-center justify-between gap-4 rounded-xl border border-line bg-surface px-5 py-3 opacity-72">
        <div className="flex items-center gap-3">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-brand text-[13px] font-semibold text-white"
            style={{ backgroundColor: avatarColor(drive.companyName) }}
          >
            {initialsFromName(drive.companyName)}
          </span>
          <div>
            <p className="text-sm font-medium text-ink">
              {drive.companyName} · {drive.roleTitle}
              <span className="ml-2 rounded-full bg-error-soft px-2 py-0.5 text-[10px] font-semibold text-error">
                Not eligible
              </span>
            </p>
            <p className="text-xs text-ink-faint">
              {eligibility.failedCriteria
                .map((f) => `${f.label} ${f.required} ✗ you have ${f.actual}`)
                .join(" · ")}
            </p>
          </div>
        </div>
        <NotifyIfCriteriaChangeButton driveId={drive.id} initialWatching={isWatching} />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-line bg-surface p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl font-brand text-lg font-semibold text-white"
            style={{ backgroundColor: avatarColor(drive.companyName) }}
          >
            {initialsFromName(drive.companyName)}
          </span>
          <div>
            <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-ink">
              {drive.companyName}
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  applied
                    ? "bg-accent-soft text-indigo-600"
                    : "bg-success-soft text-success"
                }`}
              >
                {applied ? "Applied" : "Eligible"}
              </span>
            </p>
            <p className="text-sm text-ink-secondary">{drive.roleTitle}</p>
            <p className="mt-1 text-xs text-ink-faint">
              {formatDate(drive.driveDate)}
              {drive.location ? ` · ${drive.location}` : ""}
              {drive.applyDeadline ? ` · apply by ${formatDate(drive.applyDeadline)}` : ""}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
          {drive.applyUrl ? (
            <a
              href={drive.applyUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-md bg-ink px-3 py-1.5 text-xs font-semibold text-surface"
            >
              Apply
            </a>
          ) : null}
          {application ? (
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[application.status]}`}
            >
              {STATUS_LABEL[application.status]}
            </span>
          ) : (
            <LogApplicationButton driveId={drive.id} />
          )}
        </div>
      </div>

      <p className="mt-3 text-sm text-ink-muted">{drive.description}</p>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
        <CriterionCheck
          label="CGPA"
          pass={!eligibility.failedCriteria.some((f) => f.label === "CGPA")}
        />
        <CriterionCheck
          label="No backlogs cap"
          pass={!eligibility.failedCriteria.some((f) => f.label === "Backlogs")}
        />
        <CriterionCheck
          label="Branch"
          pass={!eligibility.failedCriteria.some((f) => f.label === "Branch")}
        />
      </div>

      {driveReadiness ? (
        <div className="mt-4 rounded-lg border border-line-soft bg-surface-sunk p-3.5">
          <p className="font-mono text-[10px] tracking-[0.05em] text-ink-faint uppercase">
            Your readiness against this drive
            {driveReadiness.hiringBarScore !== null ? (
              <span className="ml-1 text-warn">
                {driveReadiness.overall ?? "—"} · their bar is around{" "}
                {driveReadiness.hiringBarScore}
              </span>
            ) : null}
          </p>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-ink-secondary">
            {driveReadiness.rounds.map((round) => (
              <span key={round.label} className="flex items-center gap-1">
                <span className="text-success">✓</span>
                {round.label} —{" "}
                <span className={round.gapText?.includes("gap") ? "font-medium text-error" : ""}>
                  {round.gapText ?? (round.value ?? "not assessed")}
                </span>
              </span>
            ))}
          </div>
          {driveReadiness.instruction ? (
            <p className="mt-2 border-t border-line-soft pt-2 text-xs text-ink-secondary">
              <span className="font-semibold">Do this:</span> {driveReadiness.instruction}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-3 flex items-center justify-between text-xs text-ink-faint">
        <Link href={`/career/questions?company=${encodeURIComponent(drive.companyName)}`} className="font-medium text-accent hover:underline">
          Question bank
        </Link>
        {batchAppliedCount !== null && batchAppliedCount > 0 ? (
          <span>
            {batchAppliedCount} from your batch applied
          </span>
        ) : null}
      </div>
    </div>
  );
}

function CriterionCheck({ label, pass }: { label: string; pass: boolean }) {
  return (
    <span className={`flex items-center gap-1 ${pass ? "text-ink-faint" : "text-error"}`}>
      <span>{pass ? "✓" : "✗"}</span>
      {label}
    </span>
  );
}
