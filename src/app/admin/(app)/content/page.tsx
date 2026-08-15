import Link from "next/link";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import CreateTrackForm from "@/components/admin/CreateTrackForm";
import CreateLectureForm from "@/components/admin/CreateLectureForm";
import CreateNoteForm from "@/components/admin/CreateNoteForm";

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
        <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-gray-900">
          Content
        </h1>
        <p className="text-sm text-gray-500">
          Add tracks, videos, quizzes and problems directly — admin-authored content publishes
          immediately.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-900">Tracks &amp; videos</h2>
        <div className="rounded-xl border border-gray-200 bg-white">
          {tracks.length ? (
            <div className="divide-y divide-gray-100">
              {tracks.map((track) => (
                <div key={track.id} className="px-5 py-3.5">
                  <p className="text-sm font-medium text-gray-900">{track.name}</p>
                  <p className="text-xs text-gray-500">
                    {track._count.lectures} lecture{track._count.lectures === 1 ? "" : "s"} ·{" "}
                    {track._count.notes} note{track._count.notes === 1 ? "" : "s"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="px-5 py-6 text-sm text-gray-500">No tracks yet.</p>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">New track</h3>
          <CreateTrackForm />
        </div>

        {tracks.length ? (
          <>
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">New lecture</h3>
              <CreateLectureForm tracks={tracks.map((t) => ({ id: t.id, name: t.name }))} />
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">New note</h3>
              <CreateNoteForm tracks={tracks.map((t) => ({ id: t.id, name: t.name }))} />
            </div>
          </>
        ) : null}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Quizzes</h2>
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
            <p className="px-5 py-6 text-sm text-gray-500">No quizzes yet.</p>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Problems</h2>
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
            <p className="px-5 py-6 text-sm text-gray-500">No problems yet.</p>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Company questions</h2>
          <Link
            href="/content/company-questions/new"
            className="rounded-md bg-black px-3 py-1.5 text-xs font-semibold text-white"
          >
            New question
          </Link>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white">
          {companyQuestions.length ? (
            <div className="divide-y divide-gray-100">
              {companyQuestions.map((companyQuestion) => (
                <div
                  key={companyQuestion.id}
                  className="flex items-center justify-between gap-3 px-5 py-3.5"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {companyQuestion.companyName}
                    </p>
                    <p className="text-xs text-gray-500">
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
            <p className="px-5 py-6 text-sm text-gray-500">No company questions yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
