import type { Entitlement } from "@prisma/client";

const RANK: Record<Entitlement, number> = {
  FREE: 0,
  INDIVIDUAL: 1,
  INSTITUTION: 2,
};

export function meetsEntitlement(
  userEntitlement: Entitlement,
  required: Entitlement
): boolean {
  return RANK[userEntitlement] >= RANK[required];
}
