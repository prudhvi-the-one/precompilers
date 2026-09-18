import type { TopicDifficulty } from "@prisma/client";

export const DIFFICULTY_STYLE: Record<TopicDifficulty, string> = {
  BEGINNER: "bg-emerald-500/15 text-emerald-300",
  INTERMEDIATE: "bg-amber-500/15 text-amber-300",
  ADVANCED: "bg-rose-500/15 text-rose-300",
};

export const DIFFICULTY_LABEL: Record<TopicDifficulty, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

// Derived from the topic's real xpReward (harder/longer topics already
// carry more XP) rather than a separate, hand-authored estimate field.
export function estimatedMinutesFor(xpReward: number): number {
  return Math.max(15, Math.round(xpReward / 20) * 5);
}
