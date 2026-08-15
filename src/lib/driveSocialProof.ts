import { prisma } from "@/lib/prisma";

export async function computeBatchAppliedCounts(
  userId: string,
  driveIds: string[]
): Promise<Map<string, number>> {
  const enrollment = await prisma.enrollment.findUnique({ where: { userId } });
  if (!enrollment || !enrollment.batchId || driveIds.length === 0) {
    return new Map();
  }

  const batchMates = await prisma.enrollment.findMany({
    where: { batchId: enrollment.batchId },
    select: { userId: true },
  });
  const batchMateIds = batchMates.map((e) => e.userId);

  const applications = await prisma.application.findMany({
    where: { driveId: { in: driveIds }, userId: { in: batchMateIds } },
    select: { driveId: true },
  });

  const counts = new Map<string, number>();
  for (const app of applications) {
    if (!app.driveId) continue;
    counts.set(app.driveId, (counts.get(app.driveId) ?? 0) + 1);
  }
  return counts;
}
