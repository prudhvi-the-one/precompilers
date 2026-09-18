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
          // "Active" = the student has real, unfinished progress in this
          // path — not a fabricated "currently selected" concept, since
          // this app has no such state for the subjects list.
          const isActive = masteredCount > 0 && masteredCount < totalCount;
          return (
            <a
              key={subject.id}
              href={`/learn/paths/${subject.slug}`}
              className="group relative block overflow-hidden rounded-3xl border border-line bg-surface p-5 transition hover:-translate-y-0.5 hover:border-line-soft"
            >
              <div
                className="absolute inset-x-0 top-0 h-[3px] opacity-70 transition group-hover:opacity-100"
                style={{ background: `linear-gradient(to right, ${subject.accentColor}, transparent)` }}
              />
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-13 w-13 items-center justify-center rounded-2xl bg-line-soft">
                  <Icon className="h-6 w-6 text-ink-secondary" />
                </span>
                <div className="flex flex-col items-end gap-1.5">
                  <span className="clip-chip bg-line-soft px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-ink-faint uppercase">
                    {subject.category}
                  </span>
                  {isActive ? (
                    <span className="clip-chip flex items-center gap-1.5 bg-fuchsia-500/15 px-2.5 py-0.5 text-[10px] font-bold text-fuchsia-300">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute h-full w-full animate-ping rounded-full bg-fuchsia-400" />
                        <span className="relative h-1.5 w-1.5 rounded-full bg-fuchsia-400" />
                      </span>
                      Active
                    </span>
                  ) : null}
                </div>
              </div>
              <h2 className="font-brand mt-4 text-lg font-bold text-ink group-hover:text-fuchsia-300">
                {subject.name}
              </h2>
              <p className="mt-1 text-xs text-ink-faint">{subject.tagline}</p>
              <div className="mt-5 border-t border-line-soft pt-3.5">
                <div className="mb-1.5 flex items-center justify-between text-[11px]">
                  <span className="font-medium text-ink-muted">Path progress</span>
                  <span className="font-mono font-bold text-cyan-300">
                    {masteredCount}/{totalCount} Topics ({pct}%)
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-line-soft">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-end text-[11px]">
                <span className="font-semibold text-fuchsia-400 transition group-hover:translate-x-0.5">
                  Explore path →
                </span>
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
