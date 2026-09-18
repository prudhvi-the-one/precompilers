import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { requireTierAccess } from "@/lib/tier";
import { prisma } from "@/lib/prisma";
import AngularBorder from "@/components/ui/AngularBorder";

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
  await requireTierAccess(user, "PRACTICE");

  const attempts = await prisma.quizAttempt.findMany({
    where: { userId: user.id, submittedAt: { not: null } },
    orderBy: { submittedAt: "desc" },
    include: { quiz: true },
  });

  return (
    <div className="max-w-3xl space-y-4">
      <div>
        <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-ink">
          History
        </h1>
        <p className="text-[14.5px] text-ink-muted">
          Every quiz and aptitude paper attempt you&apos;ve submitted.
        </p>
      </div>

      {attempts.length ? (
        <AngularBorder color="var(--line)" className="divide-y divide-line-soft bg-surface">
          {attempts.map((attempt) => {
            const verified = attempt.proctored && !attempt.endedByViolation;
            return (
              <a
                key={attempt.id}
                href={`/practice/results/${attempt.id}`}
                className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-surface-sunk"
              >
                <div>
                  <p className="text-sm font-medium text-ink">{attempt.quiz.title}</p>
                  <p className="text-xs text-ink-faint">
                    {formatDate(attempt.submittedAt as Date)}
                    {attempt.quiz.kind === "APTITUDE_PAPER" ? (
                      <span
                        className={
                          verified
                            ? "clip-chip ml-2 bg-success-soft px-2 py-0.5 font-semibold text-success"
                            : "clip-chip ml-2 bg-line-soft px-2 py-0.5 font-semibold text-ink-faint"
                        }
                      >
                        {verified ? "VERIFIED" : "SELF-PACED"}
                      </span>
                    ) : null}
                  </p>
                </div>
                <span className="font-brand text-lg font-bold text-ink">
                  {attempt.score}%
                </span>
              </a>
            );
          })}
        </AngularBorder>
      ) : (
        <AngularBorder color="var(--line)" className="bg-surface p-6 text-center text-sm text-ink-muted">
          No attempts yet.{" "}
          <a href="/practice/quizzes" className="font-semibold text-accent hover:underline">
            Take your first quiz
          </a>
          .
        </AngularBorder>
      )}
    </div>
  );
}
