import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { requireTierAccess } from "@/lib/tier";
import { prisma } from "@/lib/prisma";
import { computeOverallReadiness, computeReadinessPillars, computeDriveReadiness } from "@/lib/readiness";
import { evaluateEligibility } from "@/lib/driveEligibility";
import { computeBatchAppliedCounts } from "@/lib/driveSocialProof";
import DriveCard from "@/components/career/DriveCard";

const FILTERS = [
  { key: "eligible", label: "Eligible" },
  { key: "all", label: "All" },
  { key: "applied", label: "Applied" },
] as const;

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

function daysUntil(date: Date): number {
  return Math.ceil((date.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
}

export default async function CareerPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  await requireTierAccess(user, "CAREER");

  const { filter = "eligible" } = await searchParams;

  const now = new Date();
  const [allDrives, applications, overall, pillars] = await Promise.all([
    prisma.drive.findMany({ orderBy: { driveDate: "asc" } }),
    prisma.application.findMany({ where: { userId: user.id, driveId: { not: null } } }),
    computeOverallReadiness(user.id),
    computeReadinessPillars(user.id),
  ]);
  const drives = allDrives.filter(
    (d) => d.driveDate >= now || (d.applyDeadline && d.applyDeadline >= now)
  );
  const applicationByDriveId = new Map(applications.map((a) => [a.driveId, a]));

  const eligibilityByDrive = new Map(
    drives.map((d) => [d.id, evaluateEligibility(user, d)])
  );
  const eligibleDrives = drives.filter((d) => eligibilityByDrive.get(d.id)!.eligible);
  const appliedDrives = drives.filter((d) => applicationByDriveId.has(d.id));

  const [batchAppliedCounts, watches] = await Promise.all([
    computeBatchAppliedCounts(user.id, drives.map((d) => d.id)),
    prisma.driveEligibilityWatch.findMany({
      where: { userId: user.id, driveId: { in: drives.map((d) => d.id) } },
      select: { driveId: true },
    }),
  ]);
  const watchingDriveIds = new Set(watches.map((w) => w.driveId));

  const visibleDrives =
    filter === "applied"
      ? appliedDrives
      : filter === "eligible"
        ? eligibleDrives
        : drives;

  const featuredDrive = eligibleDrives
    .filter((d) => !applicationByDriveId.has(d.id) && d.applyDeadline && d.applyDeadline >= now)
    .sort((a, b) => (a.applyDeadline!.getTime() - b.applyDeadline!.getTime()))[0];

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-ink">
            Campus drives
          </h1>
          <p className="text-[14.5px] text-ink-muted">
            Maintained by your placement cell
            {user.cgpa !== null ? ` · CGPA ${user.cgpa}` : ""}
            {user.backlogCount !== null ? ` · ${user.backlogCount} backlogs` : ""}
            {overall !== null ? ` · readiness ${overall}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          {FILTERS.map((f) => {
            const count =
              f.key === "eligible"
                ? eligibleDrives.length
                : f.key === "applied"
                  ? appliedDrives.length
                  : drives.length;
            return (
              <Link
                key={f.key}
                href={`/career?filter=${f.key}`}
                className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium ${
                  filter === f.key
                    ? "bg-ink text-surface"
                    : "border border-line text-ink-secondary hover:bg-surface"
                }`}
              >
                {f.label} · {count}
              </Link>
            );
          })}
        </div>
      </div>

      {featuredDrive ? (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-accent-soft bg-linear-to-r from-accent-soft to-surface p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-indigo-600 font-mono text-white">
              <span className="text-sm font-bold leading-none">
                {featuredDrive.applyDeadline!.getDate()}
              </span>
              <span className="text-[9px] uppercase leading-none">
                {featuredDrive.applyDeadline!.toLocaleDateString("en-US", { month: "short" })}
              </span>
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">
                {featuredDrive.companyName} — applications close in{" "}
                {daysUntil(featuredDrive.applyDeadline!)} days
              </p>
              <p className="text-xs text-ink-faint">
                You&apos;re eligible. Don&apos;t miss the {formatDate(featuredDrive.applyDeadline!)} deadline.
              </p>
            </div>
          </div>
          <Link
            href={`/practice/problems?company=${encodeURIComponent(featuredDrive.companyName)}`}
            className="shrink-0 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-hover"
          >
            Prepare for this drive
          </Link>
        </div>
      ) : null}

      <div className="space-y-3">
        {visibleDrives.length ? (
          visibleDrives.map((drive) => {
            const eligibility = eligibilityByDrive.get(drive.id)!;
            const application = applicationByDriveId.get(drive.id);
            const driveReadiness = eligibility.eligible
              ? computeDriveReadiness(pillars, drive.hiringBarScore)
              : null;
            return (
              <DriveCard
                key={drive.id}
                drive={drive}
                eligibility={eligibility}
                application={application}
                driveReadiness={driveReadiness}
                batchAppliedCount={batchAppliedCounts.get(drive.id) ?? null}
                isWatching={watchingDriveIds.has(drive.id)}
              />
            );
          })
        ) : (
          <div className="rounded-xl border border-line bg-surface px-5 py-6 text-center">
            <p className="text-sm text-ink-muted">
              {filter === "applied"
                ? "You haven't applied to any drives yet."
                : "Your placement cell hasn't added drives yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
