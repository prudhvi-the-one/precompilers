import type { ArrayOp } from "@/lib/simulators/arrayOpsSteps";

// Per-operation mastery threshold — shared across every simulator, since
// it's about statistical confidence in a skill, not topic content.
export const MASTERY_MIN_ATTEMPTS = 3;
export const MASTERY_MIN_ACCURACY = 0.8;

export function isMastered(attempts: number, correct: number): boolean {
  return attempts >= MASTERY_MIN_ATTEMPTS && correct / attempts >= MASTERY_MIN_ACCURACY;
}

// One-time XP awards, keeping the "unlimited retries" Challenges from being
// farmable: only +2 is per-answer, everything else fires once per student
// per topic (guarded by the quest*At / masteredAt timestamps).
export const XP_PER_CORRECT_ANSWER = 2;
export const XP_PER_OPERATION_MASTERED = 50;
export const GLOBAL_XP_SHARE = 0.1;

export type QuestKey = "firstSteps" | "allOperationsAttempted" | "streak" | "allMastered";

export type QuestDefinition = {
  key: QuestKey;
  title: string;
  description: string;
  xp: number;
};

export type RankTier = { threshold: number; name: string };

export type SimulatorProgressContent = {
  operations: ArrayOp[];
  quests: QuestDefinition[];
  ranks: RankTier[];
  streakTarget: number;
};

// Bespoke per-simulator content — same one-simulator-at-a-time, hand-authored
// pattern as LEARN_CONTENT_REGISTRY and SIMULATOR_REGISTRY, keyed by the
// same stable simulatorKey. A simulator with no entry here simply has no
// Challenges/Progress data (the shell already falls back to a placeholder).
export const SIMULATOR_PROGRESS_CONTENT: Record<string, SimulatorProgressContent> = {
  "array-ops-custom": {
    operations: ["insert", "delete", "search", "traverse"],
    streakTarget: 5,
    quests: [
      { key: "firstSteps", title: "First Steps", description: "Complete your first Challenge.", xp: 10 },
      {
        key: "allOperationsAttempted",
        title: "Well Rounded",
        description: "Attempt a Challenge for every operation.",
        xp: 25,
      },
      {
        key: "streak",
        title: "Perfectionist",
        description: "Answer 5 Challenges correctly in a row.",
        xp: 40,
      },
      { key: "allMastered", title: "Array Master", description: "Master all 4 operations.", xp: 75 },
    ],
    ranks: [
      { threshold: 0, name: "Array Novice" },
      { threshold: 75, name: "Index Apprentice" },
      { threshold: 200, name: "Array Master" },
      { threshold: 400, name: "Memory Genius" },
    ],
  },
};

export function rankForXp(simulatorKey: string, xp: number) {
  const ranks = SIMULATOR_PROGRESS_CONTENT[simulatorKey]?.ranks ?? [{ threshold: 0, name: "Novice" }];
  let current = ranks[0];
  let next: RankTier | null = null;
  for (const tier of ranks) {
    if (xp >= tier.threshold) current = tier;
    else {
      next = tier;
      break;
    }
  }
  return { name: current.name, currentThreshold: current.threshold, next };
}
