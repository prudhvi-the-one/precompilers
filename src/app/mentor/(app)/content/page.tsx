import Link from "next/link";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";

const STATUS_STYLE: Record<string, string> = {
  DRAFT: "bg-line-soft text-ink-muted",
  PENDING_REVIEW: "bg-amber-50 text-amber-700",
  PUBLISHED: "bg-green-50 text-green-700",
  REJECTED: "bg-red-50 text-red-700",
};

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  PENDING_REVIEW: "Pending review",
  PUBLISHED: "Published",
  REJECTED: "Rejected",
};

export default async function MentorContentPage() {
  const mentor = await requireRole("MENTOR");
  if (!mentor) {
    return null;
  }

  const [quizzes, problems, companyQuestions] = await Promise.all([
    prisma.quiz.findMany({
      where: { authorId: mentor.id },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.problem.findMany({
      where: { authorId: mentor.id },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.companyQuestion.findMany({
      where: { authorId: mentor.id },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-ink">
          My content
        </h1>
        <p className="text-sm text-ink-faint">
          Draft quizzes and problems, then submit them for admin review before they go live.
        </p>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">My quizzes</h2>
          <Link
            href="/content/quizzes/new"
            className="rounded-md bg-ink px-3 py-1.5 text-xs font-semibold text-surface"
          >
            New quiz
          </Link>
        </div>
        <div className="rounded-xl border border-line bg-surface">
          {quizzes.length ? (
            <div className="divide-y divide-line-soft">
              {quizzes.map((quiz) => (
                <div key={quiz.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <div>
                    <p className="text-sm font-medium text-ink">{quiz.title}</p>
                    <p className="text-xs text-ink-faint">
                      {quiz.topic}
                      {quiz.status === "REJECTED" && quiz.rejectionReason
                        ? ` · ${quiz.rejectionReason}`
                        : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[quiz.status]}`}
                    >
                      {STATUS_LABEL[quiz.status]}
                    </span>
                    {quiz.status === "DRAFT" || quiz.status === "REJECTED" ? (
                      <Link
                        href={`/content/quizzes/${quiz.id}/edit`}
                        className="rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-ink-secondary hover:bg-surface-sunk"
                      >
                        Edit
                      </Link>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="px-5 py-6 text-sm text-ink-faint">No quizzes yet.</p>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">My problems</h2>
          <Link
            href="/content/problems/new"
            className="rounded-md bg-ink px-3 py-1.5 text-xs font-semibold text-surface"
          >
            New problem
          </Link>
        </div>
        <div className="rounded-xl border border-line bg-surface">
          {problems.length ? (
            <div className="divide-y divide-line-soft">
              {problems.map((problem) => (
                <div key={problem.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <div>
                    <p className="text-sm font-medium text-ink">{problem.title}</p>
                    <p className="text-xs text-ink-faint">
                      {problem.difficulty}
                      {problem.status === "REJECTED" && problem.rejectionReason
                        ? ` · ${problem.rejectionReason}`
                        : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[problem.status]}`}
                    >
                      {STATUS_LABEL[problem.status]}
                    </span>
                    {problem.status === "DRAFT" || problem.status === "REJECTED" ? (
                      <Link
                        href={`/content/problems/${problem.id}/edit`}
                        className="rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-ink-secondary hover:bg-surface-sunk"
                      >
                        Edit
                      </Link>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="px-5 py-6 text-sm text-ink-faint">No problems yet.</p>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">My company questions</h2>
          <Link
            href="/content/company-questions/new"
            className="rounded-md bg-ink px-3 py-1.5 text-xs font-semibold text-surface"
          >
            New question
          </Link>
        </div>
        <div className="rounded-xl border border-line bg-surface">
          {companyQuestions.length ? (
            <div className="divide-y divide-line-soft">
              {companyQuestions.map((companyQuestion) => (
                <div
                  key={companyQuestion.id}
                  className="flex items-center justify-between gap-3 px-5 py-3.5"
                >
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {companyQuestion.companyName}
                    </p>
                    <p className="text-xs text-ink-faint">
                      {companyQuestion.category}
                      {companyQuestion.status === "REJECTED" && companyQuestion.rejectionReason
                        ? ` · ${companyQuestion.rejectionReason}`
                        : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[companyQuestion.status]}`}
                    >
                      {STATUS_LABEL[companyQuestion.status]}
                    </span>
                    {companyQuestion.status === "DRAFT" || companyQuestion.status === "REJECTED" ? (
                      <Link
                        href={`/content/company-questions/${companyQuestion.id}/edit`}
                        className="rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-ink-secondary hover:bg-surface-sunk"
                      >
                        Edit
                      </Link>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="px-5 py-6 text-sm text-ink-faint">No company questions yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
