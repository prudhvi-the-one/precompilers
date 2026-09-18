export type Tier = "bronze" | "silver" | "gold" | "platinum" | "diamond";

export type RankInfo = {
  tier: Tier;
  tierLabel: string;
  /** 1 = closest to promotion, 3 = just entered the tier. */
  division: 1 | 2 | 3;
  /** e.g. "Silver I" */
  displayName: string;
  /** null once in the top tier — there's nothing above Diamond. */
  nextTierLabel: string | null;
  /** Readiness points needed to reach the next tier; null in Diamond. */
  pointsToNext: number | null;
  /** 0-100 position within the current tier's range. */
  progressPct: number;
};

const TIERS: { tier: Tier; label: string; min: number; max: number }[] = [
  { tier: "bronze", label: "Bronze", min: 0, max: 40 },
  { tier: "silver", label: "Silver", min: 40, max: 60 },
  { tier: "gold", label: "Gold", min: 60, max: 80 },
  { tier: "platinum", label: "Platinum", min: 80, max: 95 },
  { tier: "diamond", label: "Diamond", min: 95, max: 100 },
];

export function rankForScore(score: number): RankInfo {
  const clamped = Math.max(0, Math.min(100, score));
  const index = TIERS.findLastIndex((t) => clamped >= t.min);
  const current = TIERS[Math.max(0, index)];
  const next = TIERS[TIERS.indexOf(current) + 1] ?? null;

  const width = current.max - current.min;
  const positionInTier = clamped - current.min;
  const progressPct = width > 0 ? (positionInTier / width) * 100 : 100;

  // Divide the tier into thirds: division 1 is closest to promotion.
  const third = width / 3;
  const division: 1 | 2 | 3 =
    positionInTier >= third * 2 ? 1 : positionInTier >= third ? 2 : 3;

  return {
    tier: current.tier,
    tierLabel: current.label,
    division,
    displayName: next ? `${current.label} ${"I".repeat(division)}` : current.label,
    nextTierLabel: next?.label ?? null,
    pointsToNext: next ? Math.max(0, Math.ceil(next.min - clamped)) : null,
    progressPct: Math.round(Math.max(0, Math.min(100, progressPct))),
  };
}

export const TIER_BADGE_SRC: Record<Tier, string> = {
  bronze: "/rank-hud/badges/bronze.png",
  silver: "/rank-hud/badges/silver.png",
  gold: "/rank-hud/badges/gold.png",
  platinum: "/rank-hud/badges/platinum.png",
  diamond: "/rank-hud/badges/diamond.png",
};
