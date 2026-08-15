import type { SubscriptionTier, BillingCycle } from "@prisma/client";

export type TierDefinition = {
  tier: SubscriptionTier;
  name: string;
  tagline: string;
  monthlyPaise: number;
  annualPaise: number;
  featuresIntro?: string;
  features: string[];
  highlight?: boolean;
};

export const TIERS: TierDefinition[] = [
  {
    tier: "PRACTICE",
    name: "Practice",
    tagline: "Build the fundamentals",
    monthlyPaise: 24900,
    annualPaise: 199900,
    features: [
      "Unlimited coding practice problems",
      "Full-length aptitude test papers",
      "Quiz-based skill checks",
      "Progress tracking",
    ],
  },
  {
    tier: "LEARN",
    name: "+ Learn",
    tagline: "Structured tracks and lectures",
    monthlyPaise: 49900,
    annualPaise: 399900,
    featuresIntro: "Everything in Practice, plus:",
    features: [
      "Full video lecture library across all tracks",
      "Downloadable notes per track",
      "Structured learning paths",
    ],
  },
  {
    tier: "FULL_ACCESS",
    name: "Full Access",
    tagline: "Live classes, mentors, career tools",
    monthlyPaise: 149900,
    annualPaise: 1199900,
    featuresIntro: "Everything in + Learn, plus:",
    features: [
      "3 live instructor classes every week",
      "Mentor-led mock interviews (2/week)",
      "Peer-to-peer mock interviews (3/week)",
      "Group discussion practice",
      "Resume builder & application tracking",
    ],
    highlight: true,
  },
];

export function getTierDefinition(tier: SubscriptionTier): TierDefinition {
  const def = TIERS.find((t) => t.tier === tier);
  if (!def) {
    throw new Error(`Unknown subscription tier: ${tier}`);
  }
  return def;
}

export function priceForBillingCycle(
  def: TierDefinition,
  billingCycle: BillingCycle
): number {
  return billingCycle === "MONTHLY" ? def.monthlyPaise : def.annualPaise;
}

export function termDays(billingCycle: BillingCycle): number {
  return billingCycle === "MONTHLY" ? 30 : 365;
}

export function inr(paise: number): string {
  return `₹${Math.round(paise / 100).toLocaleString("en-IN")}`;
}
