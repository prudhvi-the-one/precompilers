import { prisma } from "@/lib/prisma";
import type { ScheduledRelease } from "@prisma/client";

export type ReleaseEngagement = {
  completedCount: number;
  totalCount: number;
  percent: number;
};

// Cross-student version of computeVendorCompletionPercent's three-way branch
// (quiz / problem / external) — how many of THESE students completed ONE
// release, instead of one student's % across ALL releases.
export async function computeReleaseEngagement(
  release: Pick<ScheduledRelease, "quizId" | "problemId" | "externalProblemSlug">,
  studentIds: string[]
): Promise<ReleaseEngagement> {
  const totalCount = studentIds.length;
  if (totalCount === 0) {
    return { completedCount: 0, totalCount: 0, percent: 0 };
  }

  let completedCount = 0;
  if (release.quizId) {
    const rows = await prisma.quizAttempt.findMany({
      where: { quizId: release.quizId, userId: { in: studentIds }, submittedAt: { not: null } },
      select: { userId: true },
      distinct: ["userId"],
    });
    completedCount = rows.length;
  } else if (release.problemId) {
    const rows = await prisma.submission.findMany({
      where: { problemId: release.problemId, userId: { in: studentIds }, verdict: "ACCEPTED" },
      select: { userId: true },
      distinct: ["userId"],
    });
    completedCount = rows.length;
  } else if (release.externalProblemSlug) {
    const rows = await prisma.externalSubmissionRecord.findMany({
      where: {
        problemSlug: release.externalProblemSlug,
        externalJudgeAccount: { userId: { in: studentIds } },
      },
      select: { externalJudgeAccount: { select: { userId: true } } },
    });
    completedCount = new Set(rows.map((r) => r.externalJudgeAccount.userId)).size;
  }

  return { completedCount, totalCount, percent: Math.round((completedCount / totalCount) * 100) };
}

export type TopicGap = {
  category: string;
  attemptedCount: number;
  gapPercent: number;
};

// Per (student, problem) pair: "attempted" = at least one submission ever,
// "solved" = at least one ACCEPTED submission. gapPercent is the share of
// attempted pairs in that category that were never solved — a real signal
// for "students keep bouncing off this topic," not just raw submission volume.
export async function computeTopicGaps(userIds: string[], limit = 5): Promise<TopicGap[]> {
  if (userIds.length === 0) return [];

  const submissions = await prisma.submission.findMany({
    where: { userId: { in: userIds } },
    select: { userId: true, problemId: true, verdict: true },
  });
  if (submissions.length === 0) return [];

  const solvedPairs = new Set<string>();
  const attemptedPairs = new Set<string>();
  const problemIds = new Set<string>();
  for (const s of submissions) {
    const key = `${s.userId}::${s.problemId}`;
    attemptedPairs.add(key);
    problemIds.add(s.problemId);
    if (s.verdict === "ACCEPTED") solvedPairs.add(key);
  }

  const problems = await prisma.problem.findMany({
    where: { id: { in: [...problemIds] } },
    select: { id: true, category: true },
  });
  const categoryByProblemId = new Map(problems.map((p) => [p.id, p.category]));

  const perCategory = new Map<string, { attempted: number; unsolved: number }>();
  for (const key of attemptedPairs) {
    const problemId = key.split("::")[1];
    const category = categoryByProblemId.get(problemId);
    if (!category) continue;
    const entry = perCategory.get(category) ?? { attempted: 0, unsolved: 0 };
    entry.attempted += 1;
    if (!solvedPairs.has(key)) entry.unsolved += 1;
    perCategory.set(category, entry);
  }

  return [...perCategory.entries()]
    .map(([category, { attempted, unsolved }]) => ({
      category,
      attemptedCount: attempted,
      gapPercent: Math.round((unsolved / attempted) * 100),
    }))
    .sort((a, b) => b.gapPercent - a.gapPercent)
    .slice(0, limit);
}
