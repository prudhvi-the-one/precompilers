import { prisma } from "@/lib/prisma";
import { subjectIcon } from "@/lib/subjectIcons";

export default async function SkillTracksGrid() {
  const subjects = await prisma.subject.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { order: "asc" },
    select: { name: true, iconKey: true, accentColor: true },
  });

  if (subjects.length === 0) {
    return null;
  }

  return (
    <section className="px-12 py-16 text-center">
      <div className="mx-auto max-w-3xl">
        <span className="inline-block rounded-full bg-accent-soft px-4 py-1.5 font-mono text-[10px] tracking-[0.1em] text-indigo-600 uppercase">
          Learning paths
        </span>
        <h2 className="mt-3.5 font-brand text-[26px] font-bold tracking-[-0.015em] text-ink">
          Build in-demand skills
        </h2>
        <p className="mt-3 text-[15px] text-ink-muted">
          Real subjects from the actual product — not a generic list.
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-6xl grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {subjects.map((subject, i) => {
          const Icon = subjectIcon(subject.iconKey);
          return (
            <div
              key={subject.name}
              className="animate-rise-in rounded-xl border border-line bg-surface p-5 transition-transform hover:-translate-y-1"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <span
                className="mx-auto flex h-10 w-10 items-center justify-center rounded-[11px]"
                style={{ backgroundColor: `${subject.accentColor}1a` }}
              >
                <Icon className="h-5 w-5" style={{ color: subject.accentColor }} strokeWidth={1.75} />
              </span>
              <p className="mt-3 font-brand text-[13px] font-bold text-ink">{subject.name}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
