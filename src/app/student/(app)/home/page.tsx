import { redirect } from "next/navigation";
import Image from "next/image";
import { UserCircle, Compass, PlayCircle, type LucideIcon } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { computeReadinessPillars, computeOverallReadiness } from "@/lib/readiness";
import { computeBatchLeaderboard } from "@/lib/leaderboard";
import { computeActivityByDay, currentStreakFromMap, longestStreakFromMap } from "@/lib/streak";
import { rankForScore, TIER_BADGE_SRC } from "@/lib/rank";
import { computeAchievements } from "@/lib/achievements";
import StreakHeatmap from "@/components/home/StreakHeatmap";
import RadarChart from "@/components/charts/RadarChart";
import AchievementBadges from "@/components/home/AchievementBadges";
import AchievementGrid from "@/components/home/AchievementGrid";
import AngularBorder from "@/components/ui/AngularBorder";
import { avatarColor, initialsFromName } from "@/lib/avatar";

// Same order as computeReadinessPillars: Fundamentals, Aptitude &
// communication, Problem solving, Industry skills, Projects, Interview
// performance.
const PILLAR_ICONS = [
  "/rank-hud/icons/fundamentals.png",
  "/rank-hud/icons/aptitude.png",
  "/rank-hud/icons/problem-solving.png",
  "/rank-hud/icons/industry-skills.png",
  "/rank-hud/icons/projects.png",
  "/rank-hud/icons/interview.png",
];

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
  const achievements = await computeAchievements(user.id, {
    longestStreak,
    profileComplete,
    pillars,
    leaderboardRank: leaderboard?.rank ?? null,
  });
  const rank = overallReadiness !== null ? rankForScore(overallReadiness) : null;

  return (
    <div className="max-w-5xl space-y-4.5">
      <AngularBorder color="var(--accent)" className="relative overflow-hidden bg-surface p-5">
        <div
          className="pointer-events-none absolute -top-16 -right-10 h-56 w-56 rounded-full opacity-10 blur-3xl"
          style={{ background: "var(--accent)" }}
        />
        <div className="relative flex items-center gap-6 flex-wrap">
          {rank ? <HeroRankBadge score={overallReadiness as number} rank={rank} /> : null}
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
            {rank ? (
              <div className="mt-3 max-w-xs">
                <div className="flex items-center justify-between gap-3 text-[11px] text-ink-faint">
                  <span>
                    {rank.pointsToNext !== null
                      ? `${rank.pointsToNext} pts to ${rank.nextTierLabel}`
                      : "Top rank reached"}
                  </span>
                  <span className="font-mono">{overallReadiness}/100</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-line-soft">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${rank.progressPct}%`, background: `var(--tier-${rank.tier})` }}
                  />
                </div>
              </div>
            ) : null}
          </div>
          <AchievementBadges achievements={achievements} />
        </div>
      </AngularBorder>

      {soonLiveClass ? (
        <AngularBorder
          color="var(--accent-soft)"
          className="flex items-center justify-between gap-4 bg-linear-to-r from-accent-soft to-surface p-4"
        >
          <div className="flex items-center gap-3">
            <span className="clip-chip flex h-10.5 w-10.5 items-center justify-center bg-indigo-600 font-mono text-[10px] font-bold text-white">
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
            className="clip-btn shrink-0 bg-indigo-600 px-4 py-2 font-brand text-[13px] font-semibold text-white hover:bg-accent-hover"
          >
            Join class
          </a>
        </AngularBorder>
      ) : null}

      <AngularBorder color="var(--line)" className="bg-surface p-5">
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
      </AngularBorder>

      <div className="grid grid-cols-1 gap-4.5 lg:grid-cols-[1.15fr_1fr]">
        <AngularBorder color="var(--line)" className="bg-surface p-5">
          {overallReadiness !== null ? (
            <>
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-brand text-base font-bold text-ink">
                  Readiness by pillar
                </h2>
                <span className="font-mono text-xl font-bold text-ink">{overallReadiness}</span>
              </div>
              <RadarChart
                axes={pillars.map((pillar) => ({ label: pillar.label, value: pillar.value ?? 0 }))}
                icons={PILLAR_ICONS}
                boldLabels
              />
            </>
          ) : (
            <div className="flex flex-col items-center py-2 text-center">
              <div className="pointer-events-none opacity-40 grayscale-[0.4]">
                <RadarChart
                  axes={pillars.map((pillar) => ({ label: pillar.label, value: pillar.value ?? 0 }))}
                  icons={PILLAR_ICONS}
                />
              </div>
              <p className="text-sm font-semibold text-ink">No readiness data yet</p>
              <p className="mt-1 max-w-xs text-xs text-ink-faint">
                Take a quiz or two once you&apos;ve set your track — this is where your pillar
                scores will show up.
              </p>
            </div>
          )}
        </AngularBorder>

        <AngularBorder color="var(--line)" className="bg-surface p-5">
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
        </AngularBorder>
      </div>

      <AngularBorder color="var(--line)" className="bg-surface p-5">
        {leaderboard ? (
          <>
            <div className="flex items-center gap-3">
              <span className="clip-chip flex h-11 w-11 shrink-0 items-center justify-center bg-accent-soft text-accent">
                <TrophyIcon />
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
            <div className="relative mb-3 h-28 w-28">
              <Image
                src="/rank-hud/league-gate.png"
                alt=""
                fill
                sizes="112px"
                className="object-contain"
                style={{ filter: "drop-shadow(0 0 18px var(--accent-soft))" }}
              />
            </div>
            <p className="text-sm font-semibold text-ink">Join a batch to see the leaderboard</p>
            <p className="mt-1 max-w-xs text-xs text-ink-faint">
              Take a quiz or two once you&apos;re in a batch to see how you compare with your
              cohort.
            </p>
            <a
              href="/onboarding"
              className="clip-btn mt-3 bg-indigo-600 px-4 py-2 font-brand text-[13px] font-semibold text-white hover:bg-accent-hover"
            >
              Set your track
            </a>
          </div>
        )}
      </AngularBorder>

      <AngularBorder color="var(--line)" className="bg-surface p-5">
        <h2 className="font-brand text-base font-bold text-ink">Achievements</h2>
        <p className="mt-0.5 text-xs text-ink-faint">
          {achievements.filter((a) => a.earned).length} of {achievements.length} unlocked
        </p>
        <div className="mt-4">
          <AchievementGrid achievements={achievements} />
        </div>
      </AngularBorder>
    </div>
  );
}

function HeroRankBadge({ score, rank }: { score: number; rank: ReturnType<typeof rankForScore> }) {
  return (
    <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
      <svg className="animate-orbit-spin absolute inset-0" viewBox="0 0 96 96" aria-hidden="true">
        <circle
          cx="48"
          cy="48"
          r="45"
          fill="none"
          stroke={`var(--tier-${rank.tier})`}
          strokeWidth="1.5"
          strokeDasharray="4 7"
          opacity="0.5"
        />
      </svg>
      <div className="animate-badge-in relative h-20 w-20">
        <Image
          src={TIER_BADGE_SRC[rank.tier]}
          alt={`${rank.tierLabel} rank badge`}
          fill
          sizes="80px"
          className="object-contain"
          style={{ filter: `drop-shadow(0 0 16px var(--tier-${rank.tier}))` }}
        />
      </div>
      <span
        className="font-brand absolute text-lg font-extrabold"
        style={{ color: "#1a1a2e", textShadow: "0 1px 0 rgba(255,255,255,0.3)" }}
      >
        {score}
      </span>
    </div>
  );
}

function TrophyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Z" />
      <path d="M7 6H4a2 2 0 0 0 2 4M17 6h3a2 2 0 0 1-2 4" />
    </svg>
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
    <AngularBorder
      color="#DDD9FB"
      className="mt-3 flex items-center gap-4 bg-accent-soft px-4 py-3"
    >
      <span className="clip-chip flex h-10.5 w-10.5 shrink-0 items-center justify-center bg-surface text-accent">
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-ink">{title}</div>
        <div className="text-xs text-ink-faint">{description}</div>
      </div>
      <AngularBorder color="#DDD9FB" clip="clip-chip" className="shrink-0 bg-surface hover:bg-surface">
        <a href={href} className="block px-3 py-1.5 text-xs font-semibold text-accent">
          {cta}
        </a>
      </AngularBorder>
    </AngularBorder>
  );
}
