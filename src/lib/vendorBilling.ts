import { prisma } from "@/lib/prisma";

// "2026-09" -> [2026-09-01T00:00:00.000Z, 2026-10-01T00:00:00.000Z)
export function monthBounds(periodMonth: string): { start: Date; end: Date } {
  const [year, month] = periodMonth.split("-").map(Number);
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));
  return { start, end };
}

export function currentPeriodMonth(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function previousPeriodMonth(): string {
  const now = new Date();
  const prev = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  return `${prev.getUTCFullYear()}-${String(prev.getUTCMonth() + 1).padStart(2, "0")}`;
}

export async function computeActiveStudentCount(
  vendorId: string,
  periodMonth: string
): Promise<number> {
  const { start, end } = monthBounds(periodMonth);
  const events = await prisma.loginEvent.findMany({
    where: {
      loggedInAt: { gte: start, lt: end },
      user: { vendorId, role: "STUDENT" },
    },
    select: { userId: true },
    distinct: ["userId"],
  });
  return events.length;
}
