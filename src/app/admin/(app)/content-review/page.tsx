import Link from "next/link";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";

function formatDate(date: Date | null): string {
  if (!date) return "";
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
}

export default async function ContentReviewPage() {
  const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  if (!admin) {
    return null;
  }

  const [quizzes, problems, companyQuestions] = await Promise.all([
    prisma.quiz.findMany({
      where: { status: "PENDING_REVIEW" },
      include: { author: { select: { name: true, email: true } } },
      orderBy: { submittedAt: "asc" },
    }),
    prisma.problem.findMany({
      where: { status: "PENDING_REVIEW" },
      include: { author: { select: { name: true, email: true } } },
      orderBy: { submittedAt: "asc" },
    }),
    prisma.companyQuestion.findMany({
      where: { status: "PENDING_REVIEW" },
      include: { author: { select: { name: true, email: true } } },
      orderBy: { submittedAt: "asc" },
    }),
  ]);

  const items = [
    ...quizzes.map((q) => ({
      type: "Quiz" as const,
      id: q.id,
      title: q.title,
      author: q.author,
      submittedAt: q.submittedAt,
      href: `/content-review/quizzes/${q.id}`,
    })),
    ...problems.map((p) => ({
      type: "Problem" as const,
      id: p.id,
      title: p.title,
      author: p.author,
      submittedAt: p.submittedAt,
      href: `/content-review/problems/${p.id}`,
    })),
    ...companyQuestions.map((c) => ({
      type: "Company question" as const,
      id: c.id,
      title: `${c.companyName} — ${c.category}`,
      author: c.author,
      submittedAt: c.submittedAt,
      href: `/content-review/company-questions/${c.id}`,
    })),
  ].sort((a, b) => (a.submittedAt?.getTime() ?? 0) - (b.submittedAt?.getTime() ?? 0));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-gray-900">
          Content review
        </h1>
        <p className="text-sm text-gray-500">
          Mentor-authored quizzes and problems awaiting approval before they go live.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white">
        {items.length ? (
          <div className="divide-y divide-gray-100">
            {items.map((item) => (
              <div key={`${item.type}-${item.id}`} className="flex items-center justify-between gap-3 px-5 py-3.5">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    <span className="mr-2 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-600">
                      {item.type}
                    </span>
                    {item.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.author?.name ?? item.author?.email ?? "Unknown mentor"} · submitted{" "}
                    {formatDate(item.submittedAt)}
                  </p>
                </div>
                <Link
                  href={item.href}
                  className="rounded-md bg-black px-3 py-1.5 text-xs font-semibold text-white"
                >
                  Review
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="px-5 py-6 text-sm text-gray-500">Nothing waiting for review.</p>
        )}
      </div>
    </div>
  );
}
