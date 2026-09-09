import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { subjectIcon } from "@/lib/subjectIcons";
import { computeSubjectPath } from "@/lib/skillTree";

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
    <div className="max-w-3xl space-y-4">
      <div>
        <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-ink">
          Learning paths
        </h1>
        <p className="text-[14.5px] text-ink-muted">
          Master each subject one topic at a time — the same path, for every subject.
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
              className="rounded-xl border border-line bg-surface p-5 hover:bg-surface-sunk"
            >
              <div className="mb-3 flex items-center gap-3">
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-[11px]"
                  style={{ backgroundColor: `${subject.accentColor}1a` }}
                >
                  <Icon className="h-5 w-5" style={{ color: subject.accentColor }} />
                </span>
                <div>
                  <h2 className="font-brand text-[15.5px] font-bold text-ink">{subject.name}</h2>
                  <p className="text-xs text-ink-faint">
                    {totalCount} topic{totalCount === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-line-soft">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, backgroundColor: subject.accentColor }}
                />
              </div>
              <div className="mt-1.5 flex justify-between text-[11.5px] text-ink-faint">
                <span>
                  {masteredCount} of {totalCount} mastered
                </span>
                <span className="font-mono font-semibold" style={{ color: subject.accentColor }}>
                  {pct}%
                </span>
              </div>
            </a>
          );
        })}
        {subjectsWithProgress.length === 0 ? (
          <p className="col-span-full text-sm text-ink-faint">No learning paths published yet.</p>
        ) : null}
      </div>
    </div>
  );
}
