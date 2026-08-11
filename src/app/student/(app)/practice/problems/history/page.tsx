import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

const VERDICT_STYLE: Record<string, string> = {
  ACCEPTED: "bg-[#E7F7F0] text-[#059669]",
  WRONG_ANSWER: "bg-[#FDEBEC] text-[#DC2626]",
  RUNTIME_ERROR: "bg-[#FDEBEC] text-[#DC2626]",
  COMPILE_ERROR: "bg-[#F2F2F7] text-[#8A8AA0]",
};

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export default async function ProblemSubmissionHistoryPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const submissions = await prisma.submission.findMany({
    where: { userId: user.id },
    orderBy: { submittedAt: "desc" },
    include: { problem: true },
  });

  return (
    <div className="max-w-3xl space-y-4">
      <div>
        <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-[#0F1020]">
          Submission history
        </h1>
        <p className="text-[14.5px] text-[#55556B]">
          Every problem you&apos;ve submitted a solution for.
        </p>
      </div>

      {submissions.length ? (
        <div className="divide-y divide-[#F2F2F7] rounded-xl border border-[#E6E6EF] bg-white">
          {submissions.map((submission) => (
            <Link
              key={submission.id}
              href={`/practice/problems/${submission.problemId}`}
              className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-[#FBFBFD]"
            >
              <div>
                <p className="text-sm font-medium text-[#0F1020]">
                  {submission.problem.title}
                </p>
                <p className="text-xs text-[#8A8AA0]">
                  {formatDate(submission.submittedAt)} · {submission.language} ·{" "}
                  {submission.passedCount}/{submission.totalCount} passed
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${VERDICT_STYLE[submission.verdict]}`}
              >
                {submission.verdict.replaceAll("_", " ")}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-[#E6E6EF] bg-white p-6 text-center text-sm text-[#55556B]">
          No submissions yet.{" "}
          <Link href="/practice/problems" className="font-semibold text-indigo-600 hover:underline">
            Solve your first problem
          </Link>
          .
        </div>
      )}
    </div>
  );
}
