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
        <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-ink">
          Proctoring recordings
        </h1>
        <p className="text-sm text-ink-faint">
          Any mentor can review any recording — flagged attempts sort first.
        </p>
      </div>

      <section className="rounded-xl border border-line bg-surface">
        {attempts.length ? (
          <div className="divide-y divide-line-soft">
            {attempts.map((attempt) => (
              <div
                key={attempt.id}
                className="flex items-center justify-between gap-3 px-5 py-3.5"
              >
                <div>
                  <p className="text-sm font-medium text-ink">
                    {attempt.user.name ?? attempt.user.email} · {attempt.quiz.title}
                  </p>
                  <p className="text-xs text-ink-faint">
                    {formatDate(attempt.submittedAt)}
                    {attempt.score !== null ? ` · ${attempt.score}%` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={
                      attempt.endedByViolation
                        ? "rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700"
                        : "rounded-full bg-line-soft px-2.5 py-0.5 text-xs font-semibold text-ink-faint"
                    }
                  >
                    {attempt.endedByViolation ? "Flagged" : "Clean"}
                  </span>
                  <Link
                    href={`/recordings/${attempt.id}`}
                    className="rounded-md bg-ink px-3 py-1.5 text-xs font-semibold text-surface"
                  >
                    Review
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="px-5 py-6 text-sm text-ink-faint">No recordings yet.</p>
        )}
      </section>
    </div>
  );
}
