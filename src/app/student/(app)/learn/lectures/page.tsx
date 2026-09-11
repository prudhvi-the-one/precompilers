import { redirect } from "next/navigation";
import { Check, PlayCircle } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { requireTierAccess } from "@/lib/tier";
import { prisma } from "@/lib/prisma";
import DownloadAffordance from "@/components/learn/DownloadAffordance";
import NoTrackEmptyState from "@/components/learn/NoTrackEmptyState";

function formatDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

export default async function LecturesPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  await requireTierAccess(user, "LEARN");

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId: user.id },
    include: { track: { include: { lectures: { orderBy: { order: "asc" } } } } },
  });

  const completedIds = enrollment
    ? new Set(
        (
          await prisma.lectureProgress.findMany({
            where: {
              userId: user.id,
              lectureId: { in: enrollment.track.lectures.map((l) => l.id) },
              completedAt: { not: null },
            },
          })
        ).map((p) => p.lectureId)
      )
    : new Set<string>();

  const totalDuration = enrollment
    ? enrollment.track.lectures.reduce((sum, l) => sum + l.durationMinutes, 0)
    : 0;
  const completedPct =
    enrollment && enrollment.track.lectures.length
      ? (completedIds.size / enrollment.track.lectures.length) * 100
      : 0;

  return (
    <div className="max-w-3xl space-y-4">
      <div>
        <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-ink">
          Lectures
        </h1>
        <p className="text-[14.5px] text-ink-muted">
          {enrollment
            ? `Every lecture in ${enrollment.track.name}.`
            : "Pick a track to see its lectures here."}
        </p>
      </div>

      {enrollment ? (
        <>
          <div className="flex items-center gap-4">
            <div className="h-2 flex-1 rounded-full bg-line-soft">
              <div
                className="animate-grow-bar-x h-full rounded-full bg-indigo-600"
                style={{ width: `${completedPct}%` }}
              />
            </div>
            <span className="shrink-0 text-xs text-ink-faint">
              {completedIds.size} of {enrollment.track.lectures.length} complete ·{" "}
              {formatDuration(totalDuration)} total
            </span>
          </div>

          <div className="divide-y divide-line-soft rounded-xl border border-line bg-surface">
            {enrollment.track.lectures.map((lecture) => {
              const completed = completedIds.has(lecture.id);
              return (
                <a
                  key={lecture.id}
                  href={`/learn/lectures/${lecture.id}`}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-surface-sunk"
                >
                  <span
                    className={`flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-full ${
                      completed
                        ? "bg-success-soft text-success"
                        : "border border-line text-ink-faintest"
                    }`}
                  >
                    {completed ? (
                      <Check className="h-4 w-4" strokeWidth={2.5} />
                    ) : (
                      <PlayCircle className="h-4 w-4" strokeWidth={1.75} />
                    )}
                  </span>
                  <span className="flex-1 text-sm text-ink">
                    {lecture.title}
                  </span>
                  <DownloadAffordance />
                  <span className="text-xs text-ink-faintest">
                    {lecture.durationMinutes} min
                  </span>
                </a>
              );
            })}
          </div>
        </>
      ) : (
        <NoTrackEmptyState description="Pick a track from Skill tracks, or let us match you to one based on your target role." />
      )}
    </div>
  );
}
