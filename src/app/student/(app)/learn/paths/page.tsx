import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { subjectIcon } from "@/lib/subjectIcons";
import { computeSubjectPath } from "@/lib/skillTree";
import CyberScope from "@/components/learn/paths/CyberScope";

export default async function LearningPathsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const subjects = await prisma.subject.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { order: "asc" },
  });

  const subjectsWithProgress = await Promise.all(
    subjects.map(async (subject) => {
      const path = await computeSubjectPath(user.id, subject.id);
      const masteredCount = path.filter((t) => t.state === "mastered").length;
      return { subject, masteredCount, totalCount: path.length };
    })
  );

  return (
    <CyberScope>
      <div className="mb-7">
        <span className="clip-chip inline-flex items-center gap-1.5 bg-accent-soft px-3 py-1 text-[11px] font-bold tracking-wider text-accent uppercase">
          Choose your learning dimension
        </span>
        <h1 className="font-brand mt-3 text-[28px] font-extrabold text-ink">
          What would you like to master today?
        </h1>
        <p className="mt-1 max-w-2xl text-[13.5px] text-ink-muted">
          10 subjects, each with its own path from first principles to mastery.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {subjectsWithProgress.map(({ subject, masteredCount, totalCount }) => {
          const Icon = subjectIcon(subject.iconKey);
          const pct = totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0;
          return (
            <a
              key={subject.id}
              href={`/learn/paths/${subject.slug}`}
              className="group relative block overflow-hidden rounded-3xl border border-line bg-surface p-5 transition hover:-translate-y-0.5 hover:border-line-soft"
            >
              <div
                className="absolute inset-x-0 top-0 h-1 opacity-60 transition group-hover:opacity-100"
                style={{ backgroundColor: subject.accentColor }}
              />
              <div className="flex items-start justify-between">
                <span
                  className="flex h-13 w-13 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: `${subject.accentColor}1f` }}
                >
                  <Icon className="h-6 w-6" style={{ color: subject.accentColor }} />
                </span>
              </div>
              <h2 className="font-brand mt-4 text-lg font-bold text-ink group-hover:text-accent">
                {subject.name}
              </h2>
              <p className="mt-1 text-xs text-ink-faint">
                {totalCount} topic{totalCount === 1 ? "" : "s"}
              </p>
              <div className="mt-5 border-t border-line-soft pt-3.5">
                <div className="mb-1.5 flex items-center justify-between text-[11px] text-ink-faint">
                  <span className="font-medium text-ink-muted">Path progress</span>
                  <span className="font-mono font-bold text-ink-secondary">
                    {masteredCount}/{totalCount} ({pct}%)
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-line-soft">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, backgroundColor: subject.accentColor }}
                  />
                </div>
              </div>
            </a>
          );
        })}
        {subjectsWithProgress.length === 0 ? (
          <p className="col-span-full text-sm text-ink-faint">No learning paths published yet.</p>
        ) : null}
      </div>
    </CyberScope>
  );
}
