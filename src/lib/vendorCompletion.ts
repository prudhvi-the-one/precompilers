import { prisma } from "@/lib/prisma";

// Live per-request, no cache/cron — matches computeActiveStudentCount's convention.
// Denominator is every ScheduledRelease the vendor has ever created (releases apply
// to the vendor's whole student population as one unit, per Phase B), so it's the
// same for every student in that vendor; numerator is whichever of those items this
// specific student has completed, ever (not "within the release's own window" —
// window-close already governs further solving, this is about overall completion).
export async function computeVendorCompletionPercent(
  vendorId: string,
  userId: string
): Promise<number> {
  const releases = await prisma.scheduledRelease.findMany({
    where: { vendorId },
    select: { quizId: true, problemId: true, externalPlatform: true, externalProblemSlug: true },
  });
  if (releases.length === 0) {
    return 0;
  }

  const [completedQuizIds, acceptedProblemIds, submissionSlugs] = await Promise.all([
    prisma.quizAttempt
      .findMany({
        where: {
          userId,
          quizId: { in: releases.filter((r) => r.quizId).map((r) => r.quizId as string) },
          submittedAt: { not: null },
        },
        select: { quizId: true },
      })
      .then((rows) => new Set(rows.map((r) => r.quizId))),
    prisma.submission
      .findMany({
        where: {
          userId,
          verdict: "ACCEPTED",
          problemId: { in: releases.filter((r) => r.problemId).map((r) => r.problemId as string) },
        },
        select: { problemId: true },
      })
      .then((rows) => new Set(rows.map((r) => r.problemId))),
    prisma.externalSubmissionRecord
      .findMany({
        where: { externalJudgeAccount: { userId } },
        select: { problemSlug: true },
      })
      .then((rows) => new Set(rows.map((r) => r.problemSlug))),
  ]);

  const completedCount = releases.filter((release) => {
    if (release.quizId) return completedQuizIds.has(release.quizId);
    if (release.problemId) return acceptedProblemIds.has(release.problemId);
    if (release.externalProblemSlug) return submissionSlugs.has(release.externalProblemSlug);
    return false;
  }).length;

  return Math.round((completedCount / releases.length) * 100);
}

export type CertificateCriteria = { minCompletionPercent: number };

export function parseCertificateCriteria(criteria: unknown): CertificateCriteria | null {
  if (
    criteria &&
    typeof criteria === "object" &&
    "minCompletionPercent" in criteria &&
    typeof (criteria as { minCompletionPercent: unknown }).minCompletionPercent === "number"
  ) {
    return criteria as CertificateCriteria;
  }
  return null;
}
