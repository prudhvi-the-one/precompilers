import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { requireTierAccess } from "@/lib/tier";
import { prisma } from "@/lib/prisma";
import { meetsEntitlement } from "@/lib/entitlement";
import StartQuizButton from "@/components/quiz/StartQuizButton";
import QuizSearchInput from "@/components/quiz/QuizSearchInput";
import QuizTopicFilterSelect from "@/components/quiz/QuizTopicFilterSelect";
import AngularBorder from "@/components/ui/AngularBorder";

const PAGE_SIZE = 12;

function pageWindow(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages = [...new Set([1, total, current - 1, current, current + 1])]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);
  const result: (number | "ellipsis")[] = [];
  for (let i = 0; i < pages.length; i++) {
    if (i > 0 && pages[i] - pages[i - 1] > 1) result.push("ellipsis");
    result.push(pages[i]);
  }
  return result;
}

function buildHref(params: { q?: string; topic?: string; page?: number }): string {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.topic) search.set("topic", params.topic);
  if (params.page && params.page > 1) search.set("page", String(params.page));
  const query = search.toString();
  return query ? `/practice/quizzes?${query}` : "/practice/quizzes";
}

export default async function QuizzesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; topic?: string; page?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { q = "", topic = "", page: pageParam } = await searchParams;

  let quizzes;
  let closesAtByQuiz = new Map<string, Date>();
  if (user.vendorId) {
    // Vendor students see only their currently-open scheduled releases —
    // a separate access mode, not the FREE/INDIVIDUAL/INSTITUTION paywall.
    const releases = await prisma.scheduledRelease.findMany({
      where: { vendorId: user.vendorId, quizId: { not: null }, closesAt: { gt: new Date() } },
      include: { quiz: { include: { sections: { include: { questions: true } } } } },
      orderBy: { releasedAt: "desc" },
    });
    quizzes = releases
      .map((r) => r.quiz)
      .filter((q): q is NonNullable<typeof q> => q !== null && q.status === "PUBLISHED");
    closesAtByQuiz = new Map(releases.map((r) => [r.quizId as string, r.closesAt]));
  } else {
    await requireTierAccess(user, "PRACTICE");
    quizzes = await prisma.quiz.findMany({
      where: { kind: "TOPIC_QUIZ", status: "PUBLISHED" },
      orderBy: { order: "asc" },
      include: { sections: { include: { questions: true } } },
    });
  }

  const topics = [...new Set(quizzes.map((quiz) => quiz.topic))].sort();

  const trimmedQuery = q.trim().toLowerCase();
  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesTopic = !topic || quiz.topic === topic;
    const matchesQuery =
      !trimmedQuery ||
      quiz.title.toLowerCase().includes(trimmedQuery) ||
      quiz.topic.toLowerCase().includes(trimmedQuery);
    return matchesTopic && matchesQuery;
  });

  const totalPages = Math.max(1, Math.ceil(filteredQuizzes.length / PAGE_SIZE));
  const requestedPage = Number(pageParam ?? "1");
  const page = Number.isFinite(requestedPage)
    ? Math.min(Math.max(1, requestedPage), totalPages)
    : 1;
  const pagedQuizzes = filteredQuizzes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const attempts = await prisma.quizAttempt.findMany({
    where: {
      userId: user.id,
      quizId: { in: quizzes.map((q) => q.id) },
      submittedAt: { not: null },
    },
    orderBy: { submittedAt: "desc" },
  });
  const lastScoreByQuiz = new Map<string, number>();
  for (const attempt of attempts) {
    if (!lastScoreByQuiz.has(attempt.quizId)) {
      lastScoreByQuiz.set(attempt.quizId, attempt.score ?? 0);
    }
  }

  const hasActiveFilter = Boolean(topic || trimmedQuery);

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-ink">
            Topic quizzes
          </h1>
          <p className="text-[14.5px] text-ink-muted">
            Short, timed quizzes across core CS &amp; AIML topics.
          </p>
        </div>
        <a
          href="/practice/quizzes/history"
          className="text-sm font-semibold text-accent hover:underline"
        >
          History
        </a>
      </div>

      <div className="flex flex-wrap gap-2.5">
        <QuizSearchInput initialValue={q} />
        <QuizTopicFilterSelect topics={topics} selected={topic || "all"} />
      </div>

      {hasActiveFilter ? (
        <div className="flex items-center gap-2 text-xs text-ink-faint">
          Filtering by
          {topic ? (
            <span className="clip-chip bg-accent-soft px-2.5 py-1 font-semibold text-accent">
              {topic}
            </span>
          ) : null}
          {trimmedQuery ? (
            <span className="clip-chip bg-line-soft px-2.5 py-1 font-semibold text-ink-secondary">
              &quot;{q.trim()}&quot;
            </span>
          ) : null}
          <a href="/practice/quizzes" className="font-semibold text-accent hover:underline">
            Clear
          </a>
        </div>
      ) : null}

      <AngularBorder color="var(--line)" className="divide-y divide-line-soft bg-surface">
        {pagedQuizzes.length ? (
          pagedQuizzes.map((quiz) => {
            const totalQuestions = quiz.sections.reduce(
              (n, s) => n + s.questions.length,
              0
            );
            const locked = user.vendorId
              ? false
              : !meetsEntitlement(user.entitlement, quiz.requiredEntitlement);
            const lastScore = lastScoreByQuiz.get(quiz.id);
            const closesAt = closesAtByQuiz.get(quiz.id);

            return (
              <div key={quiz.id} className="flex items-center justify-between gap-3 px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-ink">{quiz.title}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <a
                      href={buildHref({ topic: quiz.topic })}
                      className="clip-chip bg-accent-soft px-2.5 py-0.5 text-[10.5px] font-semibold text-accent hover:bg-accent-soft/70"
                    >
                      {quiz.topic}
                    </a>
                    <p className="text-xs text-ink-faint">
                      {totalQuestions} questions
                      {lastScore !== undefined ? ` · last score ${lastScore}%` : ""}
                      {locked ? " · 🔒 Plan" : ""}
                      {closesAt ? ` · closes ${closesAt.toLocaleString("en-US", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hourCycle: "h23" })}` : ""}
                    </p>
                  </div>
                </div>
                {locked ? (
                  <span className="text-xs text-ink-faint">Unlock with a plan</span>
                ) : (
                  <StartQuizButton
                    quizId={quiz.id}
                    label={lastScore !== undefined ? "Retake" : "Start quiz"}
                  />
                )}
              </div>
            );
          })
        ) : (
          <p className="px-5 py-6 text-center text-sm text-ink-muted">
            No quizzes match these filters.
          </p>
        )}
      </AngularBorder>

      {filteredQuizzes.length ? (
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-ink-faint">
            Showing {(page - 1) * PAGE_SIZE + 1}–
            {Math.min(page * PAGE_SIZE, filteredQuizzes.length)} of {filteredQuizzes.length}
          </span>
          <div className="flex items-center gap-1.5">
            {page > 1 ? (
              <AngularBorder clip="clip-btn" color="var(--line)" className="bg-surface">
                <a href={buildHref({ q, topic, page: page - 1 })} className="block px-3.5 py-1.5 text-[12.5px] font-semibold text-ink-secondary hover:bg-surface-sunk">
                  Prev
                </a>
              </AngularBorder>
            ) : (
              <span className="clip-btn bg-line-soft px-3.5 py-1.5 text-[12.5px] font-semibold text-ink-faintest opacity-50">
                Prev
              </span>
            )}

            {pageWindow(page, totalPages).map((entry, i) =>
              entry === "ellipsis" ? (
                <span key={`e-${i}`} className="px-1.5 text-xs text-ink-faintest">
                  …
                </span>
              ) : entry === page ? (
                <span key={entry} className="clip-chip bg-ink px-3 py-1.5 text-[12.5px] font-bold text-surface">
                  {entry}
                </span>
              ) : (
                <AngularBorder key={entry} clip="clip-chip" color="var(--line)" className="bg-surface">
                  <a href={buildHref({ q, topic, page: entry })} className="block px-3 py-1.5 text-[12.5px] font-medium text-ink-secondary hover:bg-surface-sunk">
                    {entry}
                  </a>
                </AngularBorder>
              )
            )}

            {page < totalPages ? (
              <AngularBorder clip="clip-btn" color="var(--line)" className="bg-surface">
                <a href={buildHref({ q, topic, page: page + 1 })} className="block px-3.5 py-1.5 text-[12.5px] font-semibold text-ink-secondary hover:bg-surface-sunk">
                  Next
                </a>
              </AngularBorder>
            ) : (
              <span className="clip-btn bg-line-soft px-3.5 py-1.5 text-[12.5px] font-semibold text-ink-faintest opacity-50">
                Next
              </span>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
