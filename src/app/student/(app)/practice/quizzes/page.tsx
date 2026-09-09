import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { requireTierAccess } from "@/lib/tier";
import { prisma } from "@/lib/prisma";
import { meetsEntitlement } from "@/lib/entitlement";
import StartQuizButton from "@/components/quiz/StartQuizButton";

export default async function QuizzesPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  let quizzes;
  let closesAtByQuiz = new Map<string, Date>();
  if (user.vendorId) {
    // Vendor students see only their currently-open scheduled releases —
    // a separate access mode, not the FREE/INDIVIDUAL/INSTITUTION paywall.
    const releases = await prisma.scheduledRelease.findMany({
      where: { vendorId: user.vendorId, quizId: { not: null }, closesAt: { gt: new Date() } },
      include: { quiz: { include: { sections: { include: { questions: true } } } } },
      orderBy: { releasedAt: "desc" },
    });
    quizzes = releases
      .map((r) => r.quiz)
      .filter((q): q is NonNullable<typeof q> => q !== null && q.status === "PUBLISHED");
    closesAtByQuiz = new Map(releases.map((r) => [r.quizId as string, r.closesAt]));
  } else {
    await requireTierAccess(user, "PRACTICE");
    quizzes = await prisma.quiz.findMany({
      where: { kind: "TOPIC_QUIZ", status: "PUBLISHED" },
      orderBy: { order: "asc" },
      include: { sections: { include: { questions: true } } },
    });
  }

  const attempts = await prisma.quizAttempt.findMany({
    where: {
      userId: user.id,
      quizId: { in: quizzes.map((q) => q.id) },
      submittedAt: { not: null },
    },
    orderBy: { submittedAt: "desc" },
  });
  const lastScoreByQuiz = new Map<string, number>();
  for (const attempt of attempts) {
    if (!lastScoreByQuiz.has(attempt.quizId)) {
      lastScoreByQuiz.set(attempt.quizId, attempt.score ?? 0);
    }
  }

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-ink">
            Topic quizzes
          </h1>
          <p className="text-[14.5px] text-ink-muted">
            Short, timed quizzes across core CS &amp; AIML topics.
          </p>
        </div>
        <a
          href="/practice/quizzes/history"
          className="text-sm font-semibold text-indigo-600 hover:underline"
        >
          History
        </a>
      </div>

      <div className="divide-y divide-line-soft rounded-xl border border-line bg-surface">
        {quizzes.map((quiz) => {
          const totalQuestions = quiz.sections.reduce(
            (n, s) => n + s.questions.length,
            0
          );
          const locked = user.vendorId
            ? false
            : !meetsEntitlement(user.entitlement, quiz.requiredEntitlement);
          const lastScore = lastScoreByQuiz.get(quiz.id);
          const closesAt = closesAtByQuiz.get(quiz.id);

          return (
            <div key={quiz.id} className="flex items-center justify-between gap-3 px-5 py-4">
              <div>
                <p className="text-sm font-medium text-ink">{quiz.title}</p>
                <p className="text-xs text-ink-faint">
                  {totalQuestions} questions
                  {lastScore !== undefined ? ` · last score ${lastScore}%` : ""}
                  {locked ? " · 🔒 Plan" : ""}
                  {closesAt ? ` · closes ${closesAt.toLocaleString("en-US", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hourCycle: "h23" })}` : ""}
                </p>
              </div>
              {locked ? (
                <span className="text-xs text-ink-faint">Unlock with a plan</span>
              ) : (
                <StartQuizButton
                  quizId={quiz.id}
                  label={lastScore !== undefined ? "Retake" : "Start quiz"}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
