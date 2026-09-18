import { prisma } from "@/lib/prisma";

export type AchievementIcon = "flame" | "code" | "notebook";

export type Achievement = {
  key: "streak" | "problems" | "quizzes";
  icon: AchievementIcon;
  label: string;
  earned: boolean;
  value: number;
  target: number;
};

const STREAK_TIERS = [7, 30, 100];
const PROBLEM_TIERS = [10, 50, 100];
const QUIZ_TIERS = [10, 50];

function pickTier(value: number, tiers: number[]) {
  const earnedTier = tiers.filter((t) => value >= t).at(-1) ?? null;
  const nextTier = tiers.find((t) => t > value) ?? null;
  return { earnedTier, nextTier };
}

function buildAchievement(
  key: Achievement["key"],
  icon: AchievementIcon,
  value: number,
  tiers: number[],
  label: (target: number) => string
): Achievement {
  const { earnedTier, nextTier } = pickTier(value, tiers);
  const target = nextTier ?? earnedTier ?? tiers[0];
  return {
    key,
    icon,
    value,
    target,
    earned: earnedTier !== null,
    label: label(earnedTier ?? target),
  };
}

/**
 * Real, computed achievements — no placeholder numbers. Each is shown as
 * either an earned badge (glowing) or the next tier to unlock (outlined,
 * with an "N to go" caption) so the hero never shows an empty gap even for
 * a brand-new account.
 */
export async function computeAchievements(
  userId: string,
  longestStreak: number
): Promise<Achievement[]> {
  const [solvedProblems, completedQuizzes] = await Promise.all([
    prisma.submission
      .findMany({
        where: { userId, verdict: "ACCEPTED" },
        select: { problemId: true },
        distinct: ["problemId"],
      })
      .then((rows) => rows.length),
    prisma.quizAttempt.count({ where: { userId, submittedAt: { not: null } } }),
  ]);

  return [
    buildAchievement("streak", "flame", longestStreak, STREAK_TIERS, (n) => `${n}-Day Streak`),
    buildAchievement("problems", "code", solvedProblems, PROBLEM_TIERS, (n) => `${n} Problems Solved`),
    buildAchievement("quizzes", "notebook", completedQuizzes, QUIZ_TIERS, (n) => `${n} Quizzes Done`),
  ];
}
