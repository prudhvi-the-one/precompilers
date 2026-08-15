import Link from "next/link";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { computeCohortStats } from "@/lib/cohort";
import { computeAttendanceStats } from "@/lib/attendance";
import { computeYearOverYearStats } from "@/lib/yearOverYear";

function formatDate(date: Date | null): string {
  if (!date) return "no renewal date set";
  return date.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

export default async function CohortPage({
  searchParams,
}: {
  searchParams: Promise<{ batch?: string }>;
}) {
  const user = await requireRole("INSTITUTION_ADMIN");
  if (!user || !user.institutionId) {
    redirect("/login");
  }

  const { batch: batchFilter = "all" } = await searchParams;

  const [institution, batches] = await Promise.all([
    prisma.institution.findUnique({ where: { id: user.institutionId } }),
    prisma.batch.findMany({
      where: { institutionId: user.institutionId },
      orderBy: { name: "asc" },
    }),
  ]);

  const batchIds = batchFilter === "all" ? batches.map((b) => b.id) : [batchFilter];
  const enrollments = await prisma.enrollment.findMany({
    where: { batchId: { in: batchIds } },
    select: { userId: true },
  });
  const studentIds = enrollments.map((e) => e.userId);
  const [stats, attendance, yearOverYear, seatsUsed] = await Promise.all([
    computeCohortStats(studentIds),
    computeAttendanceStats(studentIds),
    computeYearOverYearStats(user.institutionId),
    prisma.user.count({ where: { institutionId: user.institutionId, role: "STUDENT" } }),
  ]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 lg:flex-row">
      <div className="flex-1 space-y-6">
        <div>
          <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-ink">
            {institution?.name} — cohort
          </h1>
          <p className="text-sm text-ink-faint">{stats.studentCount} students enrolled</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/cohort"
            className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium ${
              batchFilter === "all" ? "bg-ink text-surface" : "border border-line text-ink-secondary"
            }`}
          >
            All batches
          </Link>
          {batches.map((b) => (
            <Link
              key={b.id}
              href={`/cohort?batch=${b.id}`}
              className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium ${
                batchFilter === b.id ? "bg-ink text-surface" : "border border-line text-ink-secondary"
              }`}
            >
              {b.name}
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-line bg-surface p-4">
            <p className="text-2xl font-bold text-ink">
              {stats.medianReadiness ?? "—"}
            </p>
            <p className="text-xs text-ink-faint">Median readiness</p>
          </div>
          <div className="rounded-xl border border-line bg-surface p-4">
            <p className="text-2xl font-bold text-success">{stats.countAbove70}</p>
            <p className="text-xs text-ink-faint">Above 70</p>
          </div>
          <div className="rounded-xl border border-line bg-surface p-4">
            <p className="text-2xl font-bold text-pink-600">{stats.countBelow40}</p>
            <p className="text-xs text-ink-faint">
              Below 40
              {stats.countBelow40 > 0 ? " · needs attention" : ""}
            </p>
          </div>
          <div className="rounded-xl border border-line bg-surface p-4">
            <p className="text-2xl font-bold text-ink">
              {attendance.averageAttendancePct !== null
                ? `${attendance.averageAttendancePct}%`
                : "—"}
            </p>
            <p className="text-xs text-ink-faint">
              Live class attendance
              {attendance.averageAttendancePct === null ? " · not enough data yet" : ""}
            </p>
          </div>
        </div>

        {batchFilter !== "all" ? (
          <div className="rounded-xl border border-line bg-surface p-5">
            <h2 className="mb-3 font-brand text-base font-bold text-ink">
              Accreditation pack
            </h2>
            <p className="mb-3 text-sm text-ink-faint">
              Attendance register and readiness summary for this batch, for NBA/NAAC evidence
              submissions.
            </p>
            <div className="flex gap-3">
              <a
                href={`/api/admin/batches/${batchFilter}/accreditation-pack?format=pdf`}
                className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-surface"
              >
                Download PDF
              </a>
              <a
                href={`/api/admin/batches/${batchFilter}/accreditation-pack?format=xlsx`}
                className="rounded-md border border-line px-4 py-2 text-sm font-semibold text-ink-secondary"
              >
                Download XLSX
              </a>
            </div>
          </div>
        ) : null}

        <div className="rounded-xl border border-line bg-surface p-5">
          <h2 className="mb-3 font-brand text-base font-bold text-ink">
            Readiness distribution
          </h2>
          <div className="flex items-end gap-3" style={{ height: 120 }}>
            {stats.histogram.map((band) => {
              const max = Math.max(1, ...stats.histogram.map((b) => b.count));
              return (
                <div key={band.band} className="flex flex-1 flex-col items-center gap-1.5">
                  <div
                    className="w-full rounded-t-md bg-indigo-500"
                    style={{ height: `${(band.count / max) * 90 + (band.count > 0 ? 10 : 0)}px` }}
                  />
                  <span className="text-[11px] text-ink-faint">{band.band}</span>
                  <span className="text-xs font-semibold text-ink-secondary">{band.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-line bg-surface p-5">
          <h2 className="mb-2 font-brand text-base font-bold text-ink">Weakest pillar</h2>
          {stats.weakestPillar ? (
            <>
              <p className="text-sm font-medium text-ink">
                {stats.weakestPillar.label} — {stats.weakestPillar.average}/100 average
              </p>
              <p className="mt-1 text-sm text-ink-faint">{stats.weakestPillar.note}</p>
            </>
          ) : (
            <p className="text-sm text-ink-faint">Not enough data yet.</p>
          )}
        </div>

        <div className="rounded-xl border border-line bg-surface p-5">
          <h2 className="mb-3 font-brand text-base font-bold text-ink">Year on year</h2>
          {yearOverYear.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-120 text-sm">
                <thead>
                  <tr className="text-left text-xs text-ink-faint">
                    <th className="pb-2 font-medium">Year</th>
                    <th className="pb-2 font-medium">Batches</th>
                    <th className="pb-2 font-medium">Students</th>
                    <th className="pb-2 font-medium">Median readiness</th>
                    <th className="pb-2 font-medium">Avg attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {yearOverYear.map((row) => (
                    <tr key={row.year} className="border-t border-line-soft">
                      <td className="py-2 font-medium text-ink">{row.year}</td>
                      <td className="py-2 text-ink-secondary">{row.batchCount}</td>
                      <td className="py-2 text-ink-secondary">{row.studentCount}</td>
                      <td className="py-2 text-ink-secondary">{row.medianReadiness ?? "—"}</td>
                      <td className="py-2 text-ink-secondary">
                        {row.avgAttendancePct !== null ? `${row.avgAttendancePct}%` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-ink-faint">No batches yet.</p>
          )}
        </div>
      </div>

      <aside className="w-64 shrink-0">
        <div className="rounded-xl border border-line bg-surface p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Licence</p>
          <p className="mt-2 text-lg font-bold text-ink">
            {seatsUsed} / {institution?.seatCount} seats
          </p>
          <div className="mt-2 h-1.5 rounded-full bg-line-soft">
            <div
              className="h-full rounded-full bg-indigo-600"
              style={{
                width: `${institution ? Math.min(100, (seatsUsed / institution.seatCount) * 100) : 0}%`,
              }}
            />
          </div>
          <p className="mt-2 text-xs text-ink-faint">Renews {formatDate(institution?.renewsAt ?? null)}</p>
        </div>
      </aside>
    </div>
  );
}
