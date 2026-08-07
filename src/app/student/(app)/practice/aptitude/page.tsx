import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { meetsEntitlement } from "@/lib/entitlement";
import StartAptitudePaperButtons from "@/components/quiz/StartAptitudePaperButtons";

export default async function AptitudePapersPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const papers = await prisma.quiz.findMany({
    where: { kind: "APTITUDE_PAPER" },
    orderBy: { order: "asc" },
    include: { sections: { include: { questions: true } } },
  });

  const attempts = await prisma.quizAttempt.findMany({
    where: {
      userId: user.id,
      quizId: { in: papers.map((p) => p.id) },
      submittedAt: { not: null },
    },
    orderBy: { submittedAt: "desc" },
  });
  const bestByPaper = new Map<string, { score: number; verified: boolean }>();
  for (const attempt of attempts) {
    const existing = bestByPaper.get(attempt.quizId);
    const verified = attempt.proctored && !attempt.endedByViolation;
    if (!existing || (attempt.score ?? 0) > existing.score) {
      bestByPaper.set(attempt.quizId, { score: attempt.score ?? 0, verified });
    }
  }

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-[#0F1020]">
            Aptitude papers
          </h1>
          <p className="text-[14.5px] text-[#55556B]">
            Sectional, timed papers patterned after real company tests.
          </p>
        </div>
        <Link
          href="/practice/quizzes/history"
          className="text-sm font-semibold text-indigo-600 hover:underline"
        >
          History
        </Link>
      </div>

      <div className="space-y-3">
        {papers.map((paper) => {
          const totalQuestions = paper.sections.reduce(
            (n, s) => n + s.questions.length,
            0
          );
          const locked = !meetsEntitlement(user.entitlement, paper.requiredEntitlement);
          const best = bestByPaper.get(paper.id);

          return (
            <div
              key={paper.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-[#E6E6EF] bg-white p-5"
            >
              <div>
                <p className="text-sm font-medium text-[#0F1020]">{paper.title}</p>
                <p className="mt-0.5 text-xs text-[#8A8AA0]">
                  {paper.sections.map((s) => s.name).join(" · ")} · {totalQuestions} questions
                </p>
                {best ? (
                  <p className="mt-1 text-xs text-[#8A8AA0]">
                    Best score {best.score}%
                    {best.verified ? (
                      <span className="ml-1.5 rounded-full bg-[#E7F7F0] px-2 py-0.5 font-semibold text-[#059669]">
                        VERIFIED
                      </span>
                    ) : (
                      <span className="ml-1.5 rounded-full bg-[#F2F2F7] px-2 py-0.5 font-semibold text-[#8A8AA0]">
                        SELF-PACED
                      </span>
                    )}
                  </p>
                ) : null}
              </div>
              {locked ? (
                <span className="text-xs text-[#8A8AA0]">Unlock with a plan</span>
              ) : (
                <StartAptitudePaperButtons paperId={paper.id} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
