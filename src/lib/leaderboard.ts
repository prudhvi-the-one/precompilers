import { prisma } from "@/lib/prisma";
import { computeOverallReadiness } from "@/lib/readiness";

export type LeaderboardEntry = {
  userId: string;
  name: string;
  score: number;
  isMe: boolean;
};

export type BatchLeaderboard = {
  entries: LeaderboardEntry[];
  rank: number;
  total: number;
};

function displayName(name: string | null): string {
  if (!name) return "Student";
  return name.trim().split(/\s+/)[0] ?? "Student";
}

export async function computeBatchLeaderboard(
  userId: string
): Promise<BatchLeaderboard | null> {
  const enrollment = await prisma.enrollment.findUnique({ where: { userId } });
  if (!enrollment || !enrollment.batchId) {
    return null;
  }

  const batchEnrollments = await prisma.enrollment.findMany({
    where: { batchId: enrollment.batchId },
    include: { user: { select: { id: true, name: true } } },
  });

  const scored = (
    await Promise.all(
      batchEnrollments.map(async ({ user }) => {
        const score = await computeOverallReadiness(user.id);
        if (score === null) return null;
        return { userId: user.id, name: displayName(user.name), score, isMe: user.id === userId };
      })
    )
  ).filter((entry): entry is LeaderboardEntry => entry !== null);

  scored.sort((a, b) => b.score - a.score);
  const rankIndex = scored.findIndex((entry) => entry.isMe);
  if (rankIndex === -1) {
    // The viewer themselves hasn't been assessed yet — nothing meaningful to rank them against.
    return null;
  }

  return {
    entries: scored,
    rank: rankIndex + 1,
    total: scored.length,
  };
}
