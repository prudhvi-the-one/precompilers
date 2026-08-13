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

export default async function RecordingsPage() {
  const mentor = await requireRole("MENTOR");
  if (!mentor) {
    return null;
  }

  const attempts = await prisma.quizAttempt.findMany({
    where: { proctored: true, recordingKey: { not: null } },
    include: { user: true, quiz: true },
    orderBy: [{ endedByViolation: "desc" }, { submittedAt: "desc" }],
    take: 50,
  });

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-gray-900">
          Proctoring recordings
        </h1>
        <p className="text-sm text-gray-500">
          Any mentor can review any recording — flagged attempts sort first.
        </p>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white">
        {attempts.length ? (
          <div className="divide-y divide-gray-100">
            {attempts.map((attempt) => (
              <div
                key={attempt.id}
                className="flex items-center justify-between gap-3 px-5 py-3.5"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {attempt.user.name ?? attempt.user.email} · {attempt.quiz.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(attempt.submittedAt)}
                    {attempt.score !== null ? ` · ${attempt.score}%` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={
                      attempt.endedByViolation
                        ? "rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700"
                        : "rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-500"
                    }
                  >
                    {attempt.endedByViolation ? "Flagged" : "Clean"}
                  </span>
                  <Link
                    href={`/recordings/${attempt.id}`}
                    className="rounded-md bg-black px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    Review
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="px-5 py-6 text-sm text-gray-500">No recordings yet.</p>
        )}
      </section>
    </div>
  );
}
