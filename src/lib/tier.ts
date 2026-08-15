import type { User, SubscriptionTier } from "@prisma/client";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export type Section = "PRACTICE" | "LEARN" | "LIVE" | "PROVE" | "CAREER";

const TIER_SECTIONS: Record<SubscriptionTier, Section[]> = {
  PRACTICE: ["PRACTICE"],
  LEARN: ["PRACTICE", "LEARN"],
  FULL_ACCESS: ["PRACTICE", "LEARN", "LIVE", "PROVE", "CAREER"],
};

export async function getActiveSubscription(userId: string) {
  return prisma.subscription.findFirst({
    where: { userId, status: "ACTIVE", expiresAt: { gt: new Date() } },
    orderBy: { expiresAt: "desc" },
  });
}

export async function hasTierAccess(
  user: User,
  section: Section
): Promise<boolean> {
  if (user.entitlement === "INSTITUTION") {
    return true;
  }

  const subscription = await getActiveSubscription(user.id);
  if (!subscription) {
    return false;
  }

  return TIER_SECTIONS[subscription.tier].includes(section);
}

// For pages: redirects to /upgrade if the section is locked. For API routes,
// use hasTierAccess() directly and return a JSON 403 instead — a redirect
// response is not a meaningful "error" for a fetch() caller.
export async function requireTierAccess(user: User, section: Section): Promise<void> {
  const ok = await hasTierAccess(user, section);
  if (!ok) {
    redirect("/upgrade");
  }
}

const ALL_SECTIONS: Section[] = ["PRACTICE", "LEARN", "LIVE", "PROVE", "CAREER"];

export async function getUnlockedSections(user: User): Promise<Section[]> {
  if (user.entitlement === "INSTITUTION") {
    return ALL_SECTIONS;
  }

  const subscription = await getActiveSubscription(user.id);
  return subscription ? TIER_SECTIONS[subscription.tier] : [];
}
