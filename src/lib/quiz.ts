import { prisma } from "@/lib/prisma";

export function isSectionExpired(
  sectionAttempt: { startedAt: Date },
  durationMinutes: number
): boolean {
  return Date.now() > sectionAttempt.startedAt.getTime() + durationMinutes * 60_000;
}

export async function scoreSection(
  sectionId: string,
  attemptId: string
): Promise<number> {
  const questions = await prisma.question.findMany({
    where: { sectionId },
    include: {
      options: true,
      responses: { where: { attemptId } },
    },
  });

  let earned = 0;
  let total = 0;
  for (const question of questions) {
    total += question.marks;
    const response = question.responses[0];
    if (response?.selectedOptionId) {
      const option = question.options.find(
        (o) => o.id === response.selectedOptionId
      );
      if (option?.isCorrect) {
        earned += question.marks;
      }
    }
  }

  return total > 0 ? Math.round((earned / total) * 100) : 0;
}

export async function finalizeAttempt(
  attemptId: string,
  endedByViolation = false
): Promise<void> {
  const sectionAttempts = await prisma.sectionAttempt.findMany({
    where: { attemptId },
  });
  const scored = sectionAttempts.filter((sa) => sa.score !== null);
  const avgScore =
    scored.length > 0
      ? Math.round(
          scored.reduce((sum, sa) => sum + (sa.score ?? 0), 0) / scored.length
        )
      : 0;

  await prisma.quizAttempt.update({
    where: { id: attemptId },
    data: { submittedAt: new Date(), score: avgScore, endedByViolation },
  });
}

export async function submitSectionAndAdvance(
  attemptId: string,
  sectionId: string
): Promise<{
  nextSectionId: string | null;
  nextSectionStartedAt: string | null;
  attemptSubmitted: boolean;
}> {
  const score = await scoreSection(sectionId, attemptId);
  await prisma.sectionAttempt.update({
    where: { attemptId_sectionId: { attemptId, sectionId } },
    data: { submittedAt: new Date(), score },
  });

  const quizAttempt = await prisma.quizAttempt.findUniqueOrThrow({
    where: { id: attemptId },
  });
  const currentSection = await prisma.quizSection.findUniqueOrThrow({
    where: { id: sectionId },
  });
  const nextSection = await prisma.quizSection.findFirst({
    where: { quizId: quizAttempt.quizId, order: { gt: currentSection.order } },
    orderBy: { order: "asc" },
  });

  if (nextSection) {
    const nextSectionAttempt = await prisma.sectionAttempt.upsert({
      where: { attemptId_sectionId: { attemptId, sectionId: nextSection.id } },
      update: {},
      create: { attemptId, sectionId: nextSection.id },
    });
    return {
      nextSectionId: nextSection.id,
      nextSectionStartedAt: nextSectionAttempt.startedAt.toISOString(),
      attemptSubmitted: false,
    };
  }

  await finalizeAttempt(attemptId);
  return { nextSectionId: null, nextSectionStartedAt: null, attemptSubmitted: true };
}

export async function forceSubmitAllRemainingSections(
  attemptId: string
): Promise<void> {
  const openSectionAttempts = await prisma.sectionAttempt.findMany({
    where: { attemptId, submittedAt: null },
  });
  for (const sectionAttempt of openSectionAttempts) {
    const score = await scoreSection(sectionAttempt.sectionId, attemptId);
    await prisma.sectionAttempt.update({
      where: { id: sectionAttempt.id },
      data: { submittedAt: new Date(), score },
    });
  }
  await finalizeAttempt(attemptId, true);
}
