import { redirect } from "next/navigation";
import Image from "next/image";
import { Calendar } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { requireTierAccess } from "@/lib/tier";
import { prisma } from "@/lib/prisma";
import NoTrackEmptyState from "@/components/learn/NoTrackEmptyState";

function formatSchedule(date: Date): string {
  return date.toLocaleString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
}

function minutesUntil(date: Date): number {
  return Math.round((date.getTime() - Date.now()) / 60000);
}

export default async function LiveClassesPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  await requireTierAccess(user, "LIVE");

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId: user.id },
    include: {
      track: true,
      batch: { include: { liveClasses: { orderBy: { scheduledAt: "asc" } } } },
    },
  });

  const liveClasses = enrollment?.batch?.liveClasses ?? [];
  const live = liveClasses.filter((lc) => {
    const mins = minutesUntil(lc.scheduledAt);
    return mins <= 0 && mins > -lc.durationMinutes;
  });
  const upcoming = liveClasses.filter((lc) => minutesUntil(lc.scheduledAt) > 0);
  const past = liveClasses.filter(
    (lc) => minutesUntil(lc.scheduledAt) <= -lc.durationMinutes
  );

  return (
    <div className="max-w-3xl space-y-4">
      <div>
        <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-ink">
          Live classes
        </h1>
        <p className="text-[14.5px] text-ink-muted">
          {enrollment
            ? `Upcoming sessions for ${enrollment.track.name}.`
            : "Pick a track to see its live class schedule."}
        </p>
      </div>

      {liveClasses.length ? (
        <div className="space-y-5">
          {live.length ? (
            <div>
              <p className="mb-2 text-[11.5px] font-bold tracking-[0.05em] text-ink-faintest uppercase">
                Live now
              </p>
              <div className="divide-y divide-line-soft rounded-xl border border-line bg-surface">
                {live.map((liveClass) => (
                  <div
                    key={liveClass.id}
                    className="flex items-center gap-3 rounded-xl bg-linear-to-r from-accent-soft to-surface px-5 py-4"
                  >
                    <span className="relative flex h-2 w-2 shrink-0 items-center justify-center">
                      <span className="h-2 w-2 rounded-full bg-error" />
                      <span className="animate-live-pulse absolute h-2 w-2 rounded-full border-2 border-error" />
                    </span>
                    <p className="flex-1 text-sm font-medium text-ink">
                      {liveClass.title}
                    </p>
                    <span className="shrink-0 rounded-full bg-error-soft px-2 py-0.5 font-mono text-[10px] font-bold text-error">
                      LIVE
                    </span>
                    <a
                      href={`/live/${liveClass.id}`}
                      className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 font-brand text-[13px] font-semibold text-white hover:bg-accent-hover"
                    >
                      Join class
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {upcoming.length ? (
            <div>
              <p className="mb-2 text-[11.5px] font-bold tracking-[0.05em] text-ink-faintest uppercase">
                Upcoming
              </p>
              <div className="divide-y divide-line-soft rounded-xl border border-line bg-surface">
                {upcoming.map((liveClass) => (
                  <div key={liveClass.id} className="flex items-center gap-3 px-5 py-4">
                    <span className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-full border border-line text-ink-faintest">
                      <Calendar className="h-4 w-4" strokeWidth={1.75} />
                    </span>
                    <p className="flex-1 text-sm font-medium text-ink">
                      {liveClass.title}
                    </p>
                    <span className="shrink-0 rounded-full bg-accent-soft px-2.5 py-0.5 font-mono text-[10.5px] text-indigo-600">
                      {formatSchedule(liveClass.scheduledAt)}
                    </span>
                    <span className="shrink-0 text-xs text-ink-faintest">
                      {liveClass.durationMinutes} min
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {past.length ? (
            <div>
              <p className="mb-2 text-[11.5px] font-bold tracking-[0.05em] text-ink-faintest uppercase">
                Past
              </p>
              <div className="divide-y divide-line-soft rounded-xl border border-line bg-surface">
                {past.map((liveClass) => (
                  <div
                    key={liveClass.id}
                    className="flex items-center gap-3 px-5 py-4 opacity-55"
                  >
                    <span className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-full border border-line text-ink-faintest">
                      <Calendar className="h-4 w-4" strokeWidth={1.75} />
                    </span>
                    <p className="flex-1 text-sm font-medium text-ink">
                      {liveClass.title}
                    </p>
                    <span className="shrink-0 rounded-full bg-line-soft px-2.5 py-0.5 text-[10.5px] text-ink-faintest">
                      {formatSchedule(liveClass.scheduledAt)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : enrollment ? (
        <div className="flex flex-col items-center rounded-xl border border-line bg-surface p-7 text-center">
          <Image
            src="/learn/live-classes-empty.png"
            alt=""
            width={200}
            height={133}
            className="mb-3"
          />
          <p className="text-sm font-semibold text-ink">No live classes scheduled yet</p>
          <p className="mt-1 max-w-xs text-xs text-ink-faint">
            Your mentor hasn&apos;t scheduled a session for this batch yet — check back
            soon.
          </p>
        </div>
      ) : (
        <NoTrackEmptyState description="Pick a track from Skill tracks to see its live class schedule." />
      )}
    </div>
  );
}
