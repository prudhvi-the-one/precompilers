import Link from "next/link";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import CreateTrackForm from "@/components/admin/CreateTrackForm";
import CreateLectureForm from "@/components/admin/CreateLectureForm";
import CreateNoteForm from "@/components/admin/CreateNoteForm";

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

export default async function AdminContentPage() {
  const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  if (!admin) {
    return null;
  }

  const [tracks, quizzes, problems, companyQuestions] = await Promise.all([
    prisma.track.findMany({
      orderBy: { order: "asc" },
      include: { _count: { select: { lectures: true, notes: true } } },
    }),
    prisma.quiz.findMany({
      orderBy: { updatedAt: "desc" },
      include: { author: { select: { name: true, email: true } } },
    }),
    prisma.problem.findMany({
      orderBy: { updatedAt: "desc" },
      include: { author: { select: { name: true, email: true } } },
    }),
    prisma.companyQuestion.findMany({
      orderBy: { updatedAt: "desc" },
      include: { author: { select: { name: true, email: true } } },
    }),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <div>
        <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-ink">
          Content
        </h1>
        <p className="text-sm text-ink-faint">
          Add tracks, videos, quizzes and problems directly — admin-authored content publishes
          immediately.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-ink">Tracks &amp; videos</h2>
        <div className="rounded-xl border border-line bg-surface">
          {tracks.length ? (
            <div className="divide-y divide-line-soft">
              {tracks.map((track) => (
                <div key={track.id} className="px-5 py-3.5">
                  <p className="text-sm font-medium text-ink">{track.name}</p>
                  <p className="text-xs text-ink-faint">
                    {track._count.lectures} lecture{track._count.lectures === 1 ? "" : "s"} ·{" "}
                    {track._count.notes} note{track._count.notes === 1 ? "" : "s"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="px-5 py-6 text-sm text-ink-faint">No tracks yet.</p>
          )}
        </div>

        <div className="rounded-xl border border-line bg-surface p-4">
          <h3 className="mb-3 text-sm font-semibold text-ink">New track</h3>
          <CreateTrackForm />
        </div>

        {tracks.length ? (
          <>
            <div className="rounded-xl border border-line bg-surface p-4">
              <h3 className="mb-3 text-sm font-semibold text-ink">New lecture</h3>
              <CreateLectureForm tracks={tracks.map((t) => ({ id: t.id, name: t.name }))} />
            </div>
            <div className="rounded-xl border border-line bg-surface p-4">
              <h3 className="mb-3 text-sm font-semibold text-ink">New note</h3>
              <CreateNoteForm tracks={tracks.map((t) => ({ id: t.id, name: t.name }))} />
            </div>
          </>
        ) : null}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">Quizzes</h2>
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
                      {quiz.topic} · by {quiz.author?.name ?? quiz.author?.email ?? "PreCompilers staff"}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[quiz.status]}`}
                  >
                    {STATUS_LABEL[quiz.status]}
                  </span>
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
          <h2 className="text-sm font-semibold text-ink">Problems</h2>
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
                      {problem.difficulty} · by{" "}
                      {problem.author?.name ?? problem.author?.email ?? "PreCompilers staff"}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[problem.status]}`}
                  >
                    {STATUS_LABEL[problem.status]}
                  </span>
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
          <h2 className="text-sm font-semibold text-ink">Company questions</h2>
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
                      {companyQuestion.category} · by{" "}
                      {companyQuestion.author?.name ??
                        companyQuestion.author?.email ??
                        "PreCompilers staff"}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLE[companyQuestion.status]}`}
                  >
                    {STATUS_LABEL[companyQuestion.status]}
                  </span>
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
