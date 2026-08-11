import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
}

export default async function QuizHistoryPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const attempts = await prisma.quizAttempt.findMany({
    where: { userId: user.id, submittedAt: { not: null } },
    orderBy: { submittedAt: "desc" },
    include: { quiz: true },
  });

  return (
    <div className="max-w-3xl space-y-4">
      <div>
        <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-[#0F1020]">
          History
        </h1>
        <p className="text-[14.5px] text-[#55556B]">
          Every quiz and aptitude paper attempt you&apos;ve submitted.
        </p>
      </div>

      {attempts.length ? (
        <div className="divide-y divide-[#F2F2F7] rounded-xl border border-[#E6E6EF] bg-white">
          {attempts.map((attempt) => {
            const verified = attempt.proctored && !attempt.endedByViolation;
            return (
              <Link
                key={attempt.id}
                href={`/practice/results/${attempt.id}`}
                className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-[#FBFBFD]"
              >
                <div>
                  <p className="text-sm font-medium text-[#0F1020]">{attempt.quiz.title}</p>
                  <p className="text-xs text-[#8A8AA0]">
                    {formatDate(attempt.submittedAt as Date)}
                    {attempt.quiz.kind === "APTITUDE_PAPER" ? (
                      <span
                        className={
                          verified
                            ? "ml-2 rounded-full bg-[#E7F7F0] px-2 py-0.5 font-semibold text-[#059669]"
                            : "ml-2 rounded-full bg-[#F2F2F7] px-2 py-0.5 font-semibold text-[#8A8AA0]"
                        }
                      >
                        {verified ? "VERIFIED" : "SELF-PACED"}
                      </span>
                    ) : null}
                  </p>
                </div>
                <span className="font-brand text-lg font-bold text-[#0F1020]">
                  {attempt.score}%
                </span>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-[#E6E6EF] bg-white p-6 text-center text-sm text-[#55556B]">
          No attempts yet.{" "}
          <Link href="/practice/quizzes" className="font-semibold text-indigo-600 hover:underline">
            Take your first quiz
          </Link>
          .
        </div>
      )}
    </div>
  );
}
