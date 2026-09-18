import { prisma } from "@/lib/prisma";

export type Achievement = {
  key: string;
  label: string;
  earned: boolean;
  kind: "tiered" | "milestone";
  /** Tiered achievements carry real x/y progress; milestones carry a
   * one-line hint shown only while unearned. */
  progress: { value: number; target: number } | null;
  hint: string | null;
};

export const ACHIEVEMENT_BADGE_SRC: Record<string, string> = {
  streak: "/rank-hud/achievements/streak.png",
  problems: "/rank-hud/achievements/problems.png",
  quizzes: "/rank-hud/achievements/quizzes.png",
  "live-classes": "/rank-hud/achievements/live-classes.png",
  profile: "/rank-hud/achievements/profile.png",
  project: "/rank-hud/achievements/project.png",
  mock: "/rank-hud/achievements/mock.png",
  "perfect-quiz": "/rank-hud/achievements/perfect-quiz.png",
  "all-rounder": "/rank-hud/achievements/all-rounder.png",
  top3: "/rank-hud/achievements/top3.png",
};

const STREAK_TIERS = [7, 30, 100];
const PROBLEM_TIERS = [10, 50, 100];
const QUIZ_TIERS = [10, 50];
const LIVE_CLASS_TIERS = [1, 5, 20];

function pickTier(value: number, tiers: number[]) {
  const earnedTier = tiers.filter((t) => value >= t).at(-1) ?? null;
  const nextTier = tiers.find((t) => t > value) ?? null;
  return { earnedTier, nextTier };
}

function buildTiered(
  key: string,
  value: number,
  tiers: number[],
  label: (target: number) => string
): Achievement {
  const { earnedTier, nextTier } = pickTier(value, tiers);
  const target = nextTier ?? earnedTier ?? tiers[0];
  return {
    key,
    kind: "tiered",
    label: label(earnedTier ?? target),
    earned: earnedTier !== null,
    progress: { value, target },
    hint: null,
  };
}

function buildMilestone(key: string, earned: boolean, label: string, hint: string): Achievement {
  return { key, kind: "milestone", label, earned, progress: null, hint: earned ? null : hint };
}

/**
 * Real, computed achievements — no placeholder numbers. Tiered ones show
 * either the highest earned tier (glowing) or the next one to unlock
 * (outlined, with real progress); milestones are a one-time unlock with a
 * plain-language hint for how to earn them.
 */
export async function computeAchievements(
  userId: string,
  ctx: {
    longestStreak: number;
    profileComplete: boolean;
    pillars: { value: number | null }[];
    leaderboardRank: number | null;
  }
): Promise<Achievement[]> {
  const [
    solvedProblems,
    completedQuizzes,
    liveClassesAttended,
    projectCount,
    mockInterviewCount,
    perfectQuizCount,
  ] = await Promise.all([
    prisma.submission
      .findMany({
        where: { userId, verdict: "ACCEPTED" },
        select: { problemId: true },
        distinct: ["problemId"],
      })
      .then((rows) => rows.length),
    prisma.quizAttempt.count({ where: { userId, submittedAt: { not: null } } }),
    prisma.liveClassAttendance.count({ where: { userId } }),
    prisma.projectSubmission.count({ where: { userId } }),
    prisma.mentorSession.count({ where: { studentId: userId, kind: "MOCK", status: "COMPLETED" } }),
    prisma.quizAttempt.count({ where: { userId, score: 100 } }),
  ]);

  const allRounder =
    ctx.pillars.length > 0 && ctx.pillars.every((p) => (p.value ?? 0) >= 50);
  const top3 = ctx.leaderboardRank !== null && ctx.leaderboardRank <= 3;

  return [
    buildTiered("streak", ctx.longestStreak, STREAK_TIERS, (n) => `${n}-Day Streak`),
    buildTiered("problems", solvedProblems, PROBLEM_TIERS, (n) => `${n} Problems Solved`),
    buildTiered("quizzes", completedQuizzes, QUIZ_TIERS, (n) => `${n} Quizzes Done`),
    buildTiered("live-classes", liveClassesAttended, LIVE_CLASS_TIERS, (n) => `${n} Live Classes`),
    buildMilestone("profile", ctx.profileComplete, "Profile Complete", "Complete your profile"),
    buildMilestone("project", projectCount > 0, "First Project", "Submit your first project"),
    buildMilestone("mock", mockInterviewCount > 0, "First Mock Interview", "Book a mock interview"),
    buildMilestone("perfect-quiz", perfectQuizCount > 0, "Perfect Score", "Score 100% on any quiz"),
    buildMilestone("all-rounder", allRounder, "All-Rounder", "Get all 6 pillars to 50+"),
    buildMilestone("top3", top3, "Top 3 in Batch", "Finish top 3 in your batch"),
  ];
}
