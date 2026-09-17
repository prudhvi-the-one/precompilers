import { redirect } from "next/navigation";
import { Target, Trophy, UserCircle, Compass, PlayCircle, type LucideIcon } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { computeReadinessPillars, computeOverallReadiness } from "@/lib/readiness";
import { computeBatchLeaderboard } from "@/lib/leaderboard";
import { computeActivityByDay, currentStreakFromMap, longestStreakFromMap } from "@/lib/streak";
import StreakHeatmap from "@/components/home/StreakHeatmap";
import RadarChart from "@/components/charts/RadarChart";
import { avatarColor, initialsFromName } from "@/lib/avatar";

function minutesUntil(date: Date): number {
  return Math.round((date.getTime() - Date.now()) / 60000);
}

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const profileComplete = Boolean(
    user.college && user.branch && user.gradYear
  );

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId: user.id },
    include: {
      track: { include: { lectures: { orderBy: { order: "asc" } } } },
      batch: {
        include: { liveClasses: { orderBy: { scheduledAt: "asc" } } },
      },
    },
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

  const nextLecture = enrollment?.track.lectures.find(
    (l) => !completedIds.has(l.id)
  );

  const soonLiveClass = enrollment?.batch?.liveClasses.find((lc) => {
    const mins = minutesUntil(lc.scheduledAt);
    return mins >= 0 && mins <= 60;
  });

  const [pillars, leaderboard, activityByDay, overallReadiness] = await Promise.all([
    computeReadinessPillars(user.id),
    computeBatchLeaderboard(user.id),
    computeActivityByDay(user.id),
    computeOverallReadiness(user.id),
  ]);
  const currentStreak = currentStreakFromMap(activityByDay);
  const longestStreak = longestStreakFromMap(activityByDay);

  return (
    <div className="max-w-5xl space-y-4.5">
      <div className="relative overflow-hidden rounded-xl border border-line-soft bg-linear-to-r from-accent-soft to-surface p-5">
        <div
          className="pointer-events-none absolute -top-16 -right-10 h-56 w-56 rounded-full opacity-10 blur-3xl"
          style={{ background: "var(--accent)" }}
        />
        <CornerMarks />
        <div className="relative flex items-center gap-5">
          <div className="min-w-0 flex-1">
            <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-ink">
              Welcome{user.name ? `, ${user.name}` : ""}
            </h1>
            <p className="text-[14.5px] text-ink-muted">
              {enrollment
                ? enrollment.track.name
                : user.gradYear
                  ? `Class of ${user.gradYear}`
                  : "Let's get your profile set up first."}
            </p>
            {overallReadiness !== null ? (
              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 font-mono text-[12px] text-accent">
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: overallReadiness >= 50 ? "var(--success)" : "var(--warn)" }}
                />
                {overallReadiness} readiness score
              </span>
            ) : null}
          </div>
          {overallReadiness !== null ? <ReadinessMatrix score={overallReadiness} /> : null}
        </div>
      </div>

      {soonLiveClass ? (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-accent-soft bg-linear-to-r from-accent-soft to-surface p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10.5 w-10.5 items-center justify-center rounded-lg bg-indigo-600 font-mono text-[10px] font-bold text-white">
              LIVE
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">
                {soonLiveClass.title}
              </p>
              <p className="text-xs text-ink-faint">
                Starts in {minutesUntil(soonLiveClass.scheduledAt)} minutes
              </p>
            </div>
          </div>
          <a
            href={`/live/${soonLiveClass.id}`}
            className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 font-brand text-[13px] font-semibold text-white hover:bg-accent-hover"
          >
            Join class
          </a>
        </div>
      ) : null}

      <div className="rounded-xl border border-line bg-surface p-5">
        <h2 className="font-brand text-base font-bold text-ink">
          What to do next
        </h2>

        {!profileComplete ? (
          <NextActionRow
            icon={UserCircle}
            title="Complete your profile"
            description="College, branch and graduation year help us personalize what's coming."
            href="/profile"
            cta="Go to profile"
          />
        ) : !enrollment ? (
          <NextActionRow
            icon={Compass}
            title="Set your track"
            description="Tell us what you're working towards so Learn has something for you."
            href="/onboarding"
            cta="Set your track"
          />
        ) : nextLecture ? (
          <NextActionRow
            icon={PlayCircle}
            title={`Continue ${enrollment.track.name}`}
            description={nextLecture.title}
            href={`/learn/lectures/${nextLecture.id}`}
            cta="Resume"
          />
        ) : (
          <p className="mt-2 text-sm text-ink-muted">
            You&apos;ve finished every lecture in {enrollment.track.name}.
            Practice, Prove and Career are being built next.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4.5 lg:grid-cols-[1.15fr_1fr]">
        <div className="relative rounded-xl border border-line bg-surface p-5">
          <CornerMarks />
          {overallReadiness !== null ? (
            <>
              <div className="flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 font-brand text-base font-bold text-ink">
                  <Target className="h-4 w-4 text-indigo-600" />
                  Readiness by pillar
                </h2>
                <span className="font-mono text-xl font-bold text-ink">{overallReadiness}</span>
              </div>
              <RadarChart
                axes={pillars.map((pillar) => ({ label: pillar.label, value: pillar.value ?? 0 }))}
                boldLabels
              />
            </>
          ) : (
            <div className="flex flex-col items-center py-2 text-center">
              <div className="pointer-events-none opacity-40 grayscale-[0.4]">
                <RadarChart
                  axes={pillars.map((pillar) => ({ label: pillar.label, value: pillar.value ?? 0 }))}
                />
              </div>
              <p className="text-sm font-semibold text-ink">No readiness data yet</p>
              <p className="mt-1 max-w-xs text-xs text-ink-faint">
                Take a quiz or two once you&apos;ve set your track — this is where your pillar
                scores will show up.
              </p>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-line bg-surface p-5">
          <h2 className="font-brand text-base font-bold text-ink">
            Activity streak
          </h2>
          <div className="mt-4">
            <StreakHeatmap
              activityByDay={Array.from(activityByDay.entries())}
              currentStreak={currentStreak}
              longestStreak={longestStreak}
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-line bg-surface p-5">
        {leaderboard ? (
          <>
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[11px] bg-accent-soft text-accent">
                <Trophy className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div>
                <h2 className="font-brand text-base font-bold text-ink">Your batch</h2>
                <p className="text-sm text-ink-muted">
                  You&apos;re <span className="font-semibold text-ink">#{leaderboard.rank}</span> of{" "}
                  {leaderboard.total} in your batch.
                </p>
              </div>
            </div>
            <div className="mt-3 space-y-2.5">
              {leaderboard.entries.slice(0, 5).map((entry, index) => (
                <LeaderboardRow key={entry.userId} rank={index + 1} entry={entry} />
              ))}
              {leaderboard.rank > 5 ? (
                <LeaderboardRow
                  rank={leaderboard.rank}
                  entry={leaderboard.entries[leaderboard.rank - 1]}
                />
              ) : null}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center py-2 text-center">
            <div className="pointer-events-none mb-3 w-full max-w-xs space-y-2.5 opacity-40">
              {[1, 2, 3].map((rank) => (
                <GhostLeaderboardRow key={rank} rank={rank} />
              ))}
            </div>
            <p className="text-sm font-semibold text-ink">Join a batch to see the leaderboard</p>
            <p className="mt-1 max-w-xs text-xs text-ink-faint">
              Take a quiz or two once you&apos;re in a batch to see how you compare with your
              cohort.
            </p>
            <a
              href="/onboarding"
              className="mt-3 rounded-lg bg-indigo-600 px-4 py-2 font-brand text-[13px] font-semibold text-white hover:bg-accent-hover"
            >
              Set your track
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function CornerMarks() {
  return (
    <>
      <span className="pointer-events-none absolute top-3 left-3 h-3 w-3 border-t-2 border-l-2 border-accent/30" />
      <span className="pointer-events-none absolute right-3 bottom-3 h-3 w-3 border-r-2 border-b-2 border-accent/30" />
    </>
  );
}

function ReadinessMatrix({ score }: { score: number }) {
  const cols = 6;
  const rows = 4;
  const total = cols * rows;
  const filled = Math.round((Math.max(0, Math.min(100, score)) / 100) * total);
  return (
    <div
      role="img"
      aria-label={`Readiness ${score} out of 100`}
      className="hidden shrink-0 sm:block"
    >
      <div className="grid grid-cols-6 gap-1.5">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={`animate-fade-scale h-3.5 w-3.5 rounded-[3px] ${
              i < filled ? "bg-accent" : "bg-line-soft"
            }`}
            style={{ animationDelay: `${i * 20}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

function GhostLeaderboardRow({ rank }: { rank: number }) {
  return (
    <div className="flex items-center gap-3 rounded-lg px-3 py-2">
      <span className="w-5 shrink-0 text-center text-xs font-semibold text-ink-faintest">
        {rank}
      </span>
      <span className="h-6 w-6 shrink-0 rounded-full bg-line-soft" />
      <span className="h-3 max-w-24 flex-1 rounded-full bg-line-soft" />
      <div className="h-1.5 w-24 shrink-0 rounded-full bg-line-soft" />
      <span className="h-3 w-8 shrink-0 rounded-full bg-line-soft" />
    </div>
  );
}

const MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

function LeaderboardRow({
  rank,
  entry,
}: {
  rank: number;
  entry: { userId: string; name: string; score: number; isMe: boolean };
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
        entry.isMe ? "bg-accent-soft" : ""
      }`}
    >
      <span className="w-5 shrink-0 text-center text-xs font-semibold text-ink-faintest">
        {MEDALS[rank] ?? rank}
      </span>
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-brand text-[10px] font-semibold text-white"
        style={{ backgroundColor: avatarColor(entry.userId) }}
      >
        {initialsFromName(entry.name)}
      </span>
      <span className="flex-1 text-sm font-medium text-ink">
        {entry.isMe ? `${entry.name} (you)` : entry.name}
      </span>
      <div className="h-1.5 w-24 shrink-0 rounded-full bg-line-soft">
        <div
          className="h-full rounded-full"
          style={{ width: `${entry.score}%`, backgroundColor: avatarColor(entry.userId) }}
        />
      </div>
      <span className="w-8 shrink-0 text-right text-xs font-mono text-ink-faint">
        {entry.score}
      </span>
    </div>
  );
}

function NextActionRow({
  icon: Icon,
  title,
  description,
  href,
  cta,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="mt-3 flex items-center gap-4 rounded-lg border border-[#DDD9FB] bg-accent-soft px-4 py-3">
      <span className="flex h-10.5 w-10.5 shrink-0 items-center justify-center rounded-[11px] bg-surface text-indigo-600">
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-ink">{title}</div>
        <div className="text-xs text-ink-faint">{description}</div>
      </div>
      <a
        href={href}
        className="shrink-0 rounded-md border border-[#DDD9FB] px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-surface"
      >
        {cta}
      </a>
    </div>
  );
}
