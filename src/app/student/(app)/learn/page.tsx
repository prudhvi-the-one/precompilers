import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { meetsEntitlement } from "@/lib/entitlement";
import TrackCoverPlaceholder from "@/components/learn/TrackCoverPlaceholder";
import StartTrackButton from "@/components/learn/StartTrackButton";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "in-progress", label: "In progress" },
  { key: "for-my-role", label: "For my role" },
  { key: "free", label: "Free" },
];

function formatClassChip(date: Date): string {
  const day = date
    .toLocaleDateString("en-US", { weekday: "short" })
    .toUpperCase();
  const time = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
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
          <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-[#0F1020]">
            Skill tracks
          </h1>
          <p className="text-[14.5px] text-[#55556B]">
            Built from what job posts ask for, not from the syllabus.
          </p>
        </div>
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <Link
              key={f.key}
              href={f.key === "all" ? "/learn" : `/learn?filter=${f.key}`}
              className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium ${
                filter === f.key
                  ? "bg-[#0F1020] text-white"
                  : "border border-[#E6E6EF] text-[#2A2A38] hover:bg-white"
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tracks.map((track) => {
          const isEnrolled = enrollment?.trackId === track.id;
          const locked = !meetsEntitlement(
            user.entitlement,
            track.requiredEntitlement
          );
          const total = track.lectures.length;

          return (
            <div
              key={track.id}
              className="rounded-xl border border-[#E6E6EF] bg-white p-4"
            >
              <TrackCoverPlaceholder label={track.name.toUpperCase()} />

              <div className="mt-3 flex items-center gap-2 text-xs">
                {isEnrolled ? (
                  <span className="rounded-full bg-[#F1F0FE] px-2.5 py-0.5 font-medium text-indigo-600">
                    In progress
                  </span>
                ) : locked ? (
                  <span className="rounded-full bg-[#F2F2F7] px-2.5 py-0.5 font-medium text-[#8A8AA0]">
                    🔒 {track.requiredEntitlement === "INSTITUTION" ? "Institution" : "Plan"}
                  </span>
                ) : (
                  <span className="rounded-full bg-[#E7F7F0] px-2.5 py-0.5 font-medium text-[#059669]">
                    Free
                  </span>
                )}
                <span className="text-[#9A9AAE]">{total} lessons</span>
              </div>

              <h2 className="mt-2 font-brand text-base font-bold text-[#0F1020]">
                {track.name}
              </h2>
              <p className="mt-1 text-sm text-[#55556B]">{track.tagline}</p>

              <div className="mt-3">
                {isEnrolled ? (
                  <>
                    <div className="h-1.5 rounded-full bg-[#EDEDF3]">
                      <div
                        className="h-full rounded-full bg-indigo-600"
                        style={{
                          width: `${total ? (completedIds.size / total) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <p className="mt-1.5 text-xs text-[#8A8AA0]">
                      {completedIds.size} of {total} lessons
                    </p>
                  </>
                ) : locked ? (
                  <p className="text-xs text-[#8A8AA0]">
                    Preview the first lesson free, or unlock the rest with a
                    plan.
                  </p>
                ) : (
                  <StartTrackButton trackId={track.id} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {enrollment ? (
        <div className="rounded-xl border border-[#E6E6EF] bg-white">
          <div className="flex items-center justify-between border-b border-[#EDEDF3] px-5 py-4">
            <h2 className="font-brand text-base font-bold text-[#0F1020]">
              Continue — {enrollment.track.name}
            </h2>
          </div>
          <div className="divide-y divide-[#F2F2F7]">
            {enrollment.track.lectures.map((lecture) => {
              const completed = completedIds.has(lecture.id);
              return (
                <Link
                  key={lecture.id}
                  href={`/learn/lectures/${lecture.id}`}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#FBFBFD]"
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs ${
                      completed
                        ? "bg-[#E7F7F0] text-[#059669]"
                        : "border border-[#DDDDE7]"
                    }`}
                  >
                    {completed ? "✓" : ""}
                  </span>
                  <span className="flex-1 text-sm text-[#0F1020]">
                    {formatLectureOrder(lecture.order)} · {lecture.title}
                  </span>
                  <span className="text-xs text-[#9A9AAE]">
                    {lecture.durationMinutes} min
                  </span>
                </Link>
              );
            })}
            {enrollment.batch?.liveClasses.map((liveClass) => (
              <a
                key={liveClass.id}
                href={liveClass.joinUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#FBFBFD]"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#DDDDE7] text-xs" />
                <span className="flex-1 text-sm text-[#0F1020]">
                  Live class — {liveClass.title}
                </span>
                <span className="rounded-full bg-[#F1F0FE] px-2 py-0.5 font-mono text-[10px] text-indigo-600">
                  {formatClassChip(liveClass.scheduledAt)}
                </span>
              </a>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-[#E6E6EF] bg-white p-6 text-center">
          <p className="text-sm text-[#55556B]">
            You haven&apos;t started a track yet.
          </p>
          <Link
            href="/onboarding"
            className="mt-2 inline-block text-sm font-semibold text-indigo-600 hover:underline"
          >
            Set your track
          </Link>
        </div>
      )}
    </div>
  );
}

function formatLectureOrder(order: number): string {
  return String(order).padStart(2, "0");
}
