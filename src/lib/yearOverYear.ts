import { prisma } from "@/lib/prisma";
import { computeCohortStats } from "@/lib/cohort";
import { computeAttendanceStats } from "@/lib/attendance";

export type YearStats = {
  year: number;
  batchCount: number;
  studentCount: number;
  medianReadiness: number | null;
  avgAttendancePct: number | null;
};

// Groups an institution's batches by the calendar year they started —
// the only real time-axis Batch.startsAt gives us — and rolls up
// readiness/attendance for each year-bucket's enrolled students.
export async function computeYearOverYearStats(institutionId: string): Promise<YearStats[]> {
  const batches = await prisma.batch.findMany({
    where: { institutionId },
    select: { id: true, startsAt: true },
  });

  const batchIdsByYear = new Map<number, string[]>();
  for (const batch of batches) {
    const year = batch.startsAt.getFullYear();
    batchIdsByYear.set(year, [...(batchIdsByYear.get(year) ?? []), batch.id]);
  }

  const years = [...batchIdsByYear.keys()].sort((a, b) => b - a);

  const results: YearStats[] = [];
  for (const year of years) {
    const batchIds = batchIdsByYear.get(year) ?? [];
    const enrollments = await prisma.enrollment.findMany({
      where: { batchId: { in: batchIds } },
      select: { userId: true },
    });
    const studentIds = enrollments.map((e) => e.userId);
    const [cohortStats, attendanceStats] = await Promise.all([
      computeCohortStats(studentIds),
      computeAttendanceStats(studentIds),
    ]);
    results.push({
      year,
      batchCount: batchIds.length,
      studentCount: studentIds.length,
      medianReadiness: cohortStats.medianReadiness,
      avgAttendancePct: attendanceStats.averageAttendancePct,
    });
  }

  return results;
}
