import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import StartQuizButton from "@/components/quiz/StartQuizButton";
import StartAptitudePaperButtons from "@/components/quiz/StartAptitudePaperButtons";

export default async function AttemptResultsPage({
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
    include: {
      quiz: true,
      sectionAttempts: { orderBy: { section: { order: "asc" } }, include: { section: true } },
      questionResponses: { include: { selectedOption: true } },
    },
  });
  if (!attempt || attempt.userId !== user.id) {
    notFound();
  }
  if (!attempt.submittedAt) {
    redirect(`/quiz-attempt/${attemptId}`);
  }

  const sections = await prisma.quizSection.findMany({
    where: { quizId: attempt.quizId },
    orderBy: { order: "asc" },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: { options: { orderBy: { order: "asc" } } },
      },
    },
  });

  const responseByQuestion = new Map(
    attempt.questionResponses.map((r) => [r.questionId, r])
  );

  const isPaper = attempt.quiz.kind === "APTITUDE_PAPER";
  const verified = attempt.proctored && !attempt.endedByViolation;

  return (
    <div className="max-w-3xl space-y-5">
      <Link href={isPaper ? "/practice/aptitude" : "/practice/quizzes"} className="text-sm text-[#8A8AA0] hover:text-[#0F1020]">
        ← {isPaper ? "Aptitude papers" : "Topic quizzes"}
      </Link>

      <div className="rounded-xl border border-[#E6E6EF] bg-white p-6">
        <div className="flex items-center gap-2">
          <p className="font-brand text-lg font-bold text-[#0F1020]">{attempt.quiz.title}</p>
          {isPaper ? (
            verified ? (
              <span className="rounded-full bg-[#E7F7F0] px-2.5 py-0.5 text-xs font-semibold text-[#059669]">
                VERIFIED
              </span>
            ) : (
              <span className="rounded-full bg-[#F2F2F7] px-2.5 py-0.5 text-xs font-semibold text-[#8A8AA0]">
                SELF-PACED
              </span>
            )
          ) : null}
        </div>
        {attempt.endedByViolation ? (
          <p className="mt-1 text-xs text-[#DB2777]">
            Ended early — you left the tab twice during a proctored attempt.
          </p>
        ) : null}
        <p className="mt-3 font-brand text-4xl font-extrabold text-[#0F1020]">
          {attempt.score}
          <span className="text-base font-medium text-[#9A9AAE]"> / 100</span>
        </p>

        {attempt.sectionAttempts.length > 1 ? (
          <div className="mt-4 grid grid-cols-3 gap-3">
            {attempt.sectionAttempts.map((sa) => (
              <div key={sa.id} className="rounded-lg border border-[#E6E6EF] p-3">
                <p className="text-xs text-[#8A8AA0]">{sa.section.name}</p>
                <p className="mt-1 font-brand text-xl font-bold text-[#0F1020]">{sa.score}%</p>
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-4">
          {isPaper ? (
            <StartAptitudePaperButtons paperId={attempt.quizId} />
          ) : (
            <StartQuizButton quizId={attempt.quizId} label="Retake quiz" />
          )}
        </div>
      </div>

      {sections.map((section) => (
        <div key={section.id} className="rounded-xl border border-[#E6E6EF] bg-white">
          <div className="border-b border-[#EDEDF3] px-5 py-3.5">
            <h2 className="font-brand text-sm font-bold text-[#0F1020]">{section.name}</h2>
          </div>
          <div className="divide-y divide-[#F2F2F7]">
            {section.questions.map((question, index) => {
              const response = responseByQuestion.get(question.id);
              const correctOption = question.options.find((o) => o.isCorrect);
              const isCorrect = response?.selectedOptionId === correctOption?.id;
              return (
                <div key={question.id} className="px-5 py-4">
                  <div className="flex items-start gap-3">
                    <span
                      className={
                        isCorrect
                          ? "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E7F7F0] text-xs text-[#059669]"
                          : "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FFF0F6] text-xs text-[#DB2777]"
                      }
                    >
                      {isCorrect ? "✓" : "✗"}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#0F1020]">
                        {index + 1}. {question.text}
                      </p>
                      <p className="mt-1 text-xs text-[#8A8AA0]">
                        Your answer:{" "}
                        {response?.selectedOption
                          ? `${response.selectedOption.label}. ${response.selectedOption.text}`
                          : "Not answered"}
                      </p>
                      {!isCorrect && correctOption ? (
                        <p className="mt-0.5 text-xs text-[#059669]">
                          Correct answer: {correctOption.label}. {correctOption.text}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
