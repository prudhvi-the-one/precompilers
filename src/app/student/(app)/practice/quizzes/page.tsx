import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { meetsEntitlement } from "@/lib/entitlement";
import StartQuizButton from "@/components/quiz/StartQuizButton";

export default async function QuizzesPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const quizzes = await prisma.quiz.findMany({
    where: { kind: "TOPIC_QUIZ", status: "PUBLISHED" },
    orderBy: { order: "asc" },
    include: { sections: { include: { questions: true } } },
  });

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
          <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-[#0F1020]">
            Topic quizzes
          </h1>
          <p className="text-[14.5px] text-[#55556B]">
            Short, timed quizzes across core CS &amp; AIML topics.
          </p>
        </div>
        <Link
          href="/practice/quizzes/history"
          className="text-sm font-semibold text-indigo-600 hover:underline"
        >
          History
        </Link>
      </div>

      <div className="divide-y divide-[#F2F2F7] rounded-xl border border-[#E6E6EF] bg-white">
        {quizzes.map((quiz) => {
          const totalQuestions = quiz.sections.reduce(
            (n, s) => n + s.questions.length,
            0
          );
          const locked = !meetsEntitlement(user.entitlement, quiz.requiredEntitlement);
          const lastScore = lastScoreByQuiz.get(quiz.id);

          return (
            <div key={quiz.id} className="flex items-center justify-between gap-3 px-5 py-4">
              <div>
                <p className="text-sm font-medium text-[#0F1020]">{quiz.title}</p>
                <p className="text-xs text-[#8A8AA0]">
                  {totalQuestions} questions
                  {lastScore !== undefined ? ` · last score ${lastScore}%` : ""}
                  {locked ? " · 🔒 Plan" : ""}
                </p>
              </div>
              {locked ? (
                <span className="text-xs text-[#8A8AA0]">Unlock with a plan</span>
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
