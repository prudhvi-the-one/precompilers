import Link from "next/link";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";

const STATUS_STYLE: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
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

  const [quizzes, problems] = await Promise.all([
    prisma.quiz.findMany({
      where: { authorId: mentor.id },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.problem.findMany({
      where: { authorId: mentor.id },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-gray-900">
          My content
        </h1>
        <p className="text-sm text-gray-500">
          Draft quizzes and problems, then submit them for admin review before they go live.
        </p>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">My quizzes</h2>
          <Link
            href="/content/quizzes/new"
            className="rounded-md bg-black px-3 py-1.5 text-xs font-semibold text-white"
          >
            New quiz
          </Link>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white">
          {quizzes.length ? (
            <div className="divide-y divide-gray-100">
              {quizzes.map((quiz) => (
                <div key={quiz.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{quiz.title}</p>
                    <p className="text-xs text-gray-500">
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
                        className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        Edit
                      </Link>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="px-5 py-6 text-sm text-gray-500">No quizzes yet.</p>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">My problems</h2>
          <Link
            href="/content/problems/new"
            className="rounded-md bg-black px-3 py-1.5 text-xs font-semibold text-white"
          >
            New problem
          </Link>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white">
          {problems.length ? (
            <div className="divide-y divide-gray-100">
              {problems.map((problem) => (
                <div key={problem.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{problem.title}</p>
                    <p className="text-xs text-gray-500">
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
                        className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        Edit
                      </Link>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="px-5 py-6 text-sm text-gray-500">No problems yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
