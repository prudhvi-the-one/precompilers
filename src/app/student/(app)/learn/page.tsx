import { redirect } from "next/navigation";
import Image from "next/image";
import { Lock, Check, PlayCircle } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { requireTierAccess } from "@/lib/tier";
import { prisma } from "@/lib/prisma";
import { meetsEntitlement } from "@/lib/entitlement";
import TrackCoverPlaceholder from "@/components/learn/TrackCoverPlaceholder";
import StartTrackButton from "@/components/learn/StartTrackButton";
import DownloadAffordance from "@/components/learn/DownloadAffordance";
import NoTrackEmptyState from "@/components/learn/NoTrackEmptyState";
import AngularBorder from "@/components/ui/AngularBorder";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "in-progress", label: "In progress" },
  { key: "for-my-role", label: "For my role" },
  { key: "free", label: "Free" },
];

// Real cover art for the current tracks, keyed by their stable slug. Any
// track not in this map (future admin-created tracks) falls back to
// TrackCoverPlaceholder's deterministic icon-on-tint treatment below.
const TRACK_COVER_BY_SLUG: Record<string, string> = {
  "sql-for-interviews": "/learn/track-sql.png",
  "aws-fundamentals": "/learn/track-aws.png",
  "react-properly": "/learn/track-react.png",
  "technical-communication": "/learn/track-comm.png",
};

function formatClassChip(date: Date): string {
  const day = date
    .toLocaleDateString("en-US", { weekday: "short" })
    .toUpperCase();
  const time = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  return `${day} ${time}`;
}

export default async function LearnPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  await requireTierAccess(user, "LEARN");

  const { filter = "all" } = await searchParams;

  const [enrollment, allTracks] = await Promise.all([
    prisma.enrollment.findUnique({
      where: { userId: user.id },
      include: {
        track: { include: { lectures: { orderBy: { order: "asc" } } } },
        batch: {
          include: { liveClasses: { orderBy: { scheduledAt: "asc" } } },
        },
      },
    }),
    prisma.track.findMany({
      orderBy: { order: "asc" },
      include: { lectures: true },
    }),
  ]);

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

  const tracks = allTracks.filter((track) => {
    if (filter === "in-progress") return enrollment?.trackId === track.id;
    if (filter === "for-my-role")
      return user.targetRole && track.relevantRoles.includes(user.targetRole);
    if (filter === "free") return track.requiredEntitlement === "FREE";
    return true;
  });

  return (
    <div className="max-w-5xl space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-ink">
            Skill tracks
          </h1>
          <p className="text-[14.5px] text-ink-muted">
            Built from what job posts ask for, not from the syllabus.
          </p>
        </div>
        <div className="flex gap-2">
          {FILTERS.map((f) =>
            filter === f.key ? (
              <a
                key={f.key}
                href={f.key === "all" ? "/learn" : `/learn?filter=${f.key}`}
                className="clip-chip bg-ink px-3.5 py-1.5 text-[13px] font-medium text-surface"
              >
                {f.label}
              </a>
            ) : (
              <AngularBorder key={f.key} clip="clip-chip" color="var(--line)" className="bg-surface">
                <a
                  href={f.key === "all" ? "/learn" : `/learn?filter=${f.key}`}
                  className="block px-3.5 py-1.5 text-[13px] font-medium text-ink-secondary hover:bg-surface-sunk"
                >
                  {f.label}
                </a>
              </AngularBorder>
            )
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tracks.map((track, i) => {
          const isEnrolled = enrollment?.trackId === track.id;
          const locked = !meetsEntitlement(
            user.entitlement,
            track.requiredEntitlement
          );
          const total = track.lectures.length;
          const cover = TRACK_COVER_BY_SLUG[track.slug];

          return (
            <div
              key={track.id}
              className="clip-panel animate-rise-in bg-line p-[2px] transition-transform hover:-translate-y-1"
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <div className="clip-panel overflow-hidden bg-surface">
                {cover ? (
                  <div className="h-30 overflow-hidden">
                    <Image
                      src={cover}
                      alt=""
                      width={400}
                      height={267}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="p-4 pb-0">
                    <TrackCoverPlaceholder trackId={track.id} label={track.name.toUpperCase()} />
                  </div>
                )}

                <div className="p-4">
                  <div className="mt-1 flex items-center gap-2 text-xs">
                    {isEnrolled ? (
                      <span className="clip-chip bg-accent-soft px-2.5 py-0.5 font-medium text-accent">
                        In progress
                      </span>
                    ) : locked ? (
                      <span className="clip-chip flex items-center gap-1 bg-line-soft px-2.5 py-0.5 font-medium text-ink-faint">
                        <Lock className="h-3 w-3" strokeWidth={2} />
                        {track.requiredEntitlement === "INSTITUTION" ? "Institution" : "Plan"}
                      </span>
                    ) : (
                      <span className="clip-chip bg-success-soft px-2.5 py-0.5 font-medium text-success">
                        Free
                      </span>
                    )}
                    <span className="text-ink-faintest">{total} lessons</span>
                  </div>

                  <h2 className="mt-2 font-brand text-base font-bold text-ink">
                    {track.name}
                  </h2>
                  <p className="mt-1 text-sm text-ink-muted">{track.tagline}</p>

                  <div className="mt-3">
                    {isEnrolled ? (
                      <>
                        <div className="h-1.5 rounded-full bg-line-soft">
                          <div
                            className="animate-grow-bar-x h-full rounded-full bg-indigo-600"
                            style={{
                              width: `${total ? (completedIds.size / total) * 100 : 0}%`,
                            }}
                          />
                        </div>
                        <p className="mt-1.5 text-xs text-ink-faint">
                          {completedIds.size} of {total} lessons
                        </p>
                      </>
                    ) : locked ? (
                      <p className="text-xs text-ink-faint">
                        Preview the first lesson free, or unlock the rest with a
                        plan.
                      </p>
                    ) : (
                      <StartTrackButton trackId={track.id} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {enrollment ? (
        <AngularBorder color="var(--line)" className="bg-surface">
          <div className="flex items-center justify-between border-b border-line-soft px-5 py-4">
            <h2 className="font-brand text-base font-bold text-ink">
              Continue — {enrollment.track.name}
            </h2>
          </div>
          <div className="divide-y divide-line-soft">
            {enrollment.track.lectures.map((lecture) => {
              const completed = completedIds.has(lecture.id);
              return (
                <a
                  key={lecture.id}
                  href={`/learn/lectures/${lecture.id}`}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-surface-sunk"
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                      completed
                        ? "bg-success-soft text-success"
                        : "border border-line text-ink-faintest"
                    }`}
                  >
                    {completed ? (
                      <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                    ) : (
                      <PlayCircle className="h-3.5 w-3.5" strokeWidth={1.75} />
                    )}
                  </span>
                  <span className="flex-1 text-sm text-ink">
                    {formatLectureOrder(lecture.order)} · {lecture.title}
                  </span>
                  <DownloadAffordance />
                  <span className="text-xs text-ink-faintest">
                    {lecture.durationMinutes} min
                  </span>
                </a>
              );
            })}
            {enrollment.batch?.liveClasses.map((liveClass) => (
              <a
                key={liveClass.id}
                href={`/live/${liveClass.id}`}
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-surface-sunk"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-line">
                  <span className="h-2 w-2 rounded-full bg-accent" />
                </span>
                <span className="flex-1 text-sm text-ink">
                  Live class — {liveClass.title}
                </span>
                <span className="clip-chip bg-accent-soft px-2 py-0.5 font-mono text-[10px] text-accent">
                  {formatClassChip(liveClass.scheduledAt)}
                </span>
              </a>
            ))}
          </div>
        </AngularBorder>
      ) : (
        <NoTrackEmptyState description="Pick one above, or let us match you to a track based on your target role." />
      )}
    </div>
  );
}

function formatLectureOrder(order: number): string {
  return String(order).padStart(2, "0");
}
