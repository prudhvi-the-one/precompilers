import { prisma } from "@/lib/prisma";
import { computeOverallReadiness, computeReadinessPillars, type PillarResult } from "@/lib/readiness";

export type CohortStats = {
  studentCount: number;
  assessedCount: number;
  medianReadiness: number | null;
  countAbove70: number;
  countBelow40: number;
  histogram: { band: string; count: number }[];
  weakestPillar: { label: string; average: number; note: string } | null;
};

const HISTOGRAM_BANDS = [
  { label: "0–20", min: 0, max: 20 },
  { label: "21–40", min: 21, max: 40 },
  { label: "41–60", min: 41, max: 60 },
  { label: "61–80", min: 61, max: 80 },
  { label: "81–100", min: 81, max: 100 },
];

// Per-student aggregation via bounded Promise.all — accepted as an N+1-shaped
// cost at Part 1's batch sizes (tens of students). Revisit with real SQL-level
// aggregation if institution batches grow past ~100-200 students.
export async function computeCohortStats(userIds: string[]): Promise<CohortStats> {
  const overallScores = await Promise.all(userIds.map((id) => computeOverallReadiness(id)));
  const assessed = overallScores.filter((v): v is number => v !== null);

  const sorted = [...assessed].sort((a, b) => a - b);
  const medianReadiness =
    sorted.length === 0
      ? null
      : sorted.length % 2 === 1
        ? sorted[(sorted.length - 1) / 2]
        : Math.round((sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2);

  const histogram = HISTOGRAM_BANDS.map((band) => ({
    band: band.label,
    count: assessed.filter((v) => v >= band.min && v <= band.max).length,
  }));

  const allPillars = await Promise.all(userIds.map((id) => computeReadinessPillars(id)));
  const pillarLabels = allPillars[0]?.map((p) => p.label) ?? [];
  let weakestPillar: CohortStats["weakestPillar"] = null;

  if (pillarLabels.length > 0) {
    const perPillarAverages = pillarLabels.map((label, index) => {
      const scored = allPillars
        .map((pillars) => pillars[index])
        .filter((p): p is PillarResult => p !== undefined && p.value !== null)
        .map((p) => p.value as number);
      const notStartedCount = allPillars.filter(
        (pillars) => pillars[index]?.value === null
      ).length;
      const average = scored.length > 0 ? scored.reduce((s, v) => s + v, 0) / scored.length : null;
      return { label, average, notStartedCount };
    });

    const withData = perPillarAverages.filter(
      (p): p is { label: string; average: number; notStartedCount: number } => p.average !== null
    );
    if (withData.length > 0) {
      const weakest = withData.reduce((min, p) => (p.average < min.average ? p : min));
      weakestPillar = {
        label: weakest.label,
        average: Math.round(weakest.average),
        note:
          weakest.notStartedCount > 0
            ? `${weakest.notStartedCount} student${weakest.notStartedCount === 1 ? " hasn't" : "s haven't"} started this yet.`
            : `Average ${Math.round(weakest.average)}/100 across the cohort.`,
      };
    }
  }

  return {
    studentCount: userIds.length,
    assessedCount: assessed.length,
    medianReadiness,
    countAbove70: assessed.filter((v) => v > 70).length,
    countBelow40: assessed.filter((v) => v < 40).length,
    histogram,
    weakestPillar,
  };
}

// Real, cheap proxy for "is this student doing anything lately" — explicitly
// not attendance (no class join-log model exists anywhere in the schema).
export async function computeEngagement(
  userIds: string[]
): Promise<{ engagedCount: number; totalCount: number }> {
  if (userIds.length === 0) {
    return { engagedCount: 0, totalCount: 0 };
  }
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [lectureActive, quizActive, submissionActive] = await Promise.all([
    prisma.lectureProgress.findMany({
      where: { userId: { in: userIds }, completedAt: { gte: sevenDaysAgo } },
      select: { userId: true },
    }),
    prisma.quizAttempt.findMany({
      where: { userId: { in: userIds }, startedAt: { gte: sevenDaysAgo } },
      select: { userId: true },
    }),
    prisma.submission.findMany({
      where: { userId: { in: userIds }, submittedAt: { gte: sevenDaysAgo } },
      select: { userId: true },
    }),
  ]);

  const engagedIds = new Set([
    ...lectureActive.map((r) => r.userId),
    ...quizActive.map((r) => r.userId),
    ...submissionActive.map((r) => r.userId),
  ]);

  return { engagedCount: engagedIds.size, totalCount: userIds.length };
}
