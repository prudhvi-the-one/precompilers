import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function PracticePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const [quizCount, paperCount, problemCount] = await Promise.all([
    prisma.quiz.count({ where: { kind: "TOPIC_QUIZ" } }),
    prisma.quiz.count({ where: { kind: "APTITUDE_PAPER" } }),
    prisma.problem.count(),
  ]);

  return (
    <div className="max-w-3xl space-y-4">
      <div>
        <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-ink">
          Practice
        </h1>
        <p className="text-[14.5px] text-ink-muted">
          Coding problems, quizzes, and aptitude papers.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          href="/practice/quizzes"
          className="rounded-xl border border-line bg-surface p-5 hover:bg-surface-sunk"
        >
          <h2 className="font-brand text-base font-bold text-ink">Topic quizzes</h2>
          <p className="mt-1 text-sm text-ink-muted">
            {quizCount} quizzes across core CS &amp; AIML topics.
          </p>
        </Link>
        <Link
          href="/practice/aptitude"
          className="rounded-xl border border-line bg-surface p-5 hover:bg-surface-sunk"
        >
          <h2 className="font-brand text-base font-bold text-ink">Aptitude papers</h2>
          <p className="mt-1 text-sm text-ink-muted">
            {paperCount} full sectional paper{paperCount === 1 ? "" : "s"}, proctored or practice.
          </p>
        </Link>
        <Link
          href="/practice/problems"
          className="rounded-xl border border-line bg-surface p-5 hover:bg-surface-sunk"
        >
          <h2 className="font-brand text-base font-bold text-ink">Coding problems</h2>
          <p className="mt-1 text-sm text-ink-muted">
            {problemCount} problem{problemCount === 1 ? "" : "s"} across core topics.
          </p>
        </Link>
      </div>
    </div>
  );
}
