import { prisma } from "@/lib/prisma";
import { toISTDateKey, daysBefore } from "@/lib/streak";

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

export type DailyActiveStudents = {
  series: { date: string; count: number }[];
  weeklyAverage: number;
};

// Same IST-day bucketing convention as streak.ts, applied to LoginEvent
// instead of per-user activity — distinct students active per day, not raw
// login-event count, over the trailing `days` window (inclusive of today).
export async function computeDailyActiveStudents(
  vendorId: string,
  days: number
): Promise<DailyActiveStudents> {
  const todayKey = toISTDateKey(new Date());
  const earliestKey = daysBefore(todayKey, days - 1);
  const earliestDate = new Date(`${earliestKey}T00:00:00.000Z`);

  const events = await prisma.loginEvent.findMany({
    where: {
      loggedInAt: { gte: earliestDate },
      user: { vendorId, role: "STUDENT" },
    },
    select: { userId: true, loggedInAt: true },
  });

  const usersByDay = new Map<string, Set<string>>();
  for (const event of events) {
    const key = toISTDateKey(event.loggedInAt);
    const set = usersByDay.get(key) ?? new Set<string>();
    set.add(event.userId);
    usersByDay.set(key, set);
  }

  const series: { date: string; count: number }[] = [];
  let cursor = earliestKey;
  for (let i = 0; i < days; i++) {
    series.push({ date: cursor, count: usersByDay.get(cursor)?.size ?? 0 });
    cursor = daysBefore(cursor, -1);
  }

  const last7 = series.slice(-7);
  const weeklyAverage =
    last7.length > 0 ? Math.round((last7.reduce((sum, d) => sum + d.count, 0) / last7.length) * 10) / 10 : 0;

  return { series, weeklyAverage };
}
