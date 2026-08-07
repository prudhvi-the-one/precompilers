import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import QuizAttemptClient from "@/components/quiz/QuizAttemptClient";

export default async function QuizAttemptPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { attemptId } = await params;

  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: attemptId },
    include: { sectionAttempts: true, questionResponses: true, quiz: true },
  });
  if (!attempt || attempt.userId !== user.id) {
    notFound();
  }

  if (attempt.submittedAt) {
    redirect(`/practice/results/${attemptId}`);
  }

  const sections = await prisma.quizSection.findMany({
    where: { quizId: attempt.quizId },
    orderBy: { order: "asc" },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: {
          options: {
            orderBy: { order: "asc" },
            select: { id: true, label: true, text: true },
          },
        },
      },
    },
  });

  return (
    <QuizAttemptClient
      attemptId={attempt.id}
      quizTitle={attempt.quiz.title}
      proctored={attempt.proctored}
      isPaper={attempt.quiz.kind === "APTITUDE_PAPER"}
      sections={sections}
      initialSectionAttempts={attempt.sectionAttempts.map((sa) => ({
        sectionId: sa.sectionId,
        startedAt: sa.startedAt.toISOString(),
        submittedAt: sa.submittedAt?.toISOString() ?? null,
        score: sa.score,
      }))}
      initialResponses={attempt.questionResponses.map((r) => ({
        questionId: r.questionId,
        selectedOptionId: r.selectedOptionId,
        flagged: r.flagged,
        seen: r.seen,
      }))}
      initialViolationCount={attempt.violationCount}
      resultsHref={`/practice/results/${attemptId}`}
    />
  );
}
