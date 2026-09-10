import { redirect } from "next/navigation";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { computeVendorCompletionPercent } from "@/lib/vendorCompletion";
import { currentPeriodMonth, monthBounds } from "@/lib/vendorBilling";
import GroupedBarChart from "@/components/charts/GroupedBarChart";

const SERIES_COLORS = ["var(--accent)", "var(--pillar-pink)", "var(--chart-secondary)", "var(--success)"];

async function computeBatchStats(vendorId: string, studentIds: string[]) {
  if (studentIds.length === 0) {
    return { completion: 0, activeRate: 0, avgQuizScore: 0 };
  }

  const { start, end } = monthBounds(currentPeriodMonth());
  const [completions, activeEvents, quizAttempts] = await Promise.all([
    Promise.all(studentIds.map((id) => computeVendorCompletionPercent(vendorId, id))),
    prisma.loginEvent.findMany({
      where: { userId: { in: studentIds }, loggedInAt: { gte: start, lt: end } },
      select: { userId: true },
      distinct: ["userId"],
    }),
    prisma.quizAttempt.findMany({
      where: { userId: { in: studentIds }, submittedAt: { not: null }, score: { not: null } },
      select: { score: true },
    }),
  ]);

  const completion = Math.round(completions.reduce((s, v) => s + v, 0) / studentIds.length);
  const activeRate = Math.round((activeEvents.length / studentIds.length) * 100);
  const avgQuizScore = quizAttempts.length
    ? Math.round(quizAttempts.reduce((s, a) => s + (a.score ?? 0), 0) / quizAttempts.length)
    : 0;

  return { completion, activeRate, avgQuizScore };
}

export default async function VendorBatchesPage() {
  const user = await requireRole("VENDOR_ADMIN");
  if (!user || !user.vendorId) {
    redirect("/login");
  }

  const vendor = await prisma.vendor.findUnique({
    where: { id: user.vendorId },
    include: {
      batches: {
        orderBy: { startsAt: "desc" },
        include: {
          track: { select: { name: true } },
          enrollments: { select: { userId: true } },
        },
      },
    },
  });
  if (!vendor) {
    redirect("/login");
  }

  const batchStats = await Promise.all(
    vendor.batches.map(async (batch) => ({
      batch,
      studentIds: batch.enrollments.map((e) => e.userId),
      stats: await computeBatchStats(vendor.id, batch.enrollments.map((e) => e.userId)),
    }))
  );

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-brand text-[28px] font-bold tracking-[-0.015em] text-ink">Batches</h1>
        <p className="mt-1 text-sm text-ink-faint">
          {vendor.batches.length} batch{vendor.batches.length === 1 ? "" : "es"} · compare cohort health
          side by side
        </p>
      </div>

      {batchStats.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface px-5 py-8 text-center">
          <p className="text-sm font-medium text-ink">No batches yet.</p>
          <p className="mt-1 text-xs text-ink-faint">
            Assign your students to batches from the admin side to compare cohorts here.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {batchStats.map(({ batch, studentIds, stats }, i) => (
              <div key={batch.id} className="rounded-2xl border border-line bg-surface p-5">
                <div className="flex items-center gap-2.5">
                  <span
                    className="h-3 w-3 rounded-[4px]"
                    style={{ background: SERIES_COLORS[i % SERIES_COLORS.length] }}
                  />
                  <h3 className="font-brand text-[15px] font-bold text-ink">{batch.name}</h3>
                </div>
                <p className="mb-4 mt-1 text-xs text-ink-faint">
                  {studentIds.length} student{studentIds.length === 1 ? "" : "s"} · {batch.track.name}
                </p>
                {(
                  [
                    ["Completion", stats.completion],
                    ["Active rate", stats.activeRate],
                    ["Avg. quiz score", stats.avgQuizScore],
                  ] as const
                ).map(([label, value]) => (
                  <div key={label} className="mt-2.5 flex items-center gap-2.5 text-[12.5px] text-ink-muted">
                    <span className="w-24 shrink-0">{label}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line-soft">
                      <div
                        className="animate-grow-bar-x h-full rounded-full"
                        style={{ width: `${Math.max(2, value)}%`, background: SERIES_COLORS[i % SERIES_COLORS.length] }}
                      />
                    </div>
                    <span className="w-9 shrink-0 text-right font-mono font-semibold text-ink">{value}%</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-line bg-surface p-6">
            <h2 className="mb-4 font-brand text-[15px] font-bold text-ink">Cohort health, side by side</h2>
            <GroupedBarChart
              metrics={[
                {
                  label: "Completion",
                  values: batchStats.map((b) => b.stats.completion),
                  valueLabels: batchStats.map((b) => `${b.stats.completion}%`),
                },
                {
                  label: "Active rate",
                  values: batchStats.map((b) => b.stats.activeRate),
                  valueLabels: batchStats.map((b) => `${b.stats.activeRate}%`),
                },
                {
                  label: "Avg. quiz score",
                  values: batchStats.map((b) => b.stats.avgQuizScore),
                  valueLabels: batchStats.map((b) => `${b.stats.avgQuizScore}%`),
                },
              ]}
              seriesLabels={batchStats.map((b) => b.batch.name)}
              seriesColors={batchStats.map((_, i) => SERIES_COLORS[i % SERIES_COLORS.length])}
            />
          </div>
        </>
      )}
    </div>
  );
}
