import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function PracticePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const [quizCount, paperCount] = await Promise.all([
    prisma.quiz.count({ where: { kind: "TOPIC_QUIZ" } }),
    prisma.quiz.count({ where: { kind: "APTITUDE_PAPER" } }),
  ]);

  return (
    <div className="max-w-3xl space-y-4">
      <div>
        <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-[#0F1020]">
          Practice
        </h1>
        <p className="text-[14.5px] text-[#55556B]">
          Quizzes, aptitude papers, and — soon — coding problems.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          href="/practice/quizzes"
          className="rounded-xl border border-[#E6E6EF] bg-white p-5 hover:bg-[#FBFBFD]"
        >
          <h2 className="font-brand text-base font-bold text-[#0F1020]">Topic quizzes</h2>
          <p className="mt-1 text-sm text-[#55556B]">
            {quizCount} quizzes across core CS &amp; AIML topics.
          </p>
        </Link>
        <Link
          href="/practice/aptitude"
          className="rounded-xl border border-[#E6E6EF] bg-white p-5 hover:bg-[#FBFBFD]"
        >
          <h2 className="font-brand text-base font-bold text-[#0F1020]">Aptitude papers</h2>
          <p className="mt-1 text-sm text-[#55556B]">
            {paperCount} full sectional paper{paperCount === 1 ? "" : "s"}, proctored or practice.
          </p>
        </Link>
        <div className="rounded-xl border border-[#E6E6EF] bg-[#FBFBFD] p-5">
          <h2 className="font-brand text-base font-bold text-[#9A9AAE]">Coding problems</h2>
          <p className="mt-1 text-sm text-[#9A9AAE]">Coming soon.</p>
        </div>
      </div>
    </div>
  );
}
