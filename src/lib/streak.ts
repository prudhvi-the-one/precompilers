import { prisma } from "@/lib/prisma";

const IST_TIME_ZONE = "Asia/Kolkata";

export function toISTDateKey(date: Date): string {
  return date.toLocaleDateString("en-CA", { timeZone: IST_TIME_ZONE }); // YYYY-MM-DD
}

export function daysBefore(dateKey: string, days: number): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

export async function computeActivityByDay(userId: string): Promise<Map<string, number>> {
  const [lectures, quizAttempts, projectSubmissions, submissions, liveClassAttendances] =
    await Promise.all([
      prisma.lectureProgress.findMany({
        where: { userId, completedAt: { not: null } },
        select: { completedAt: true },
      }),
      prisma.quizAttempt.findMany({
        where: { userId, submittedAt: { not: null } },
        select: { submittedAt: true },
      }),
      prisma.projectSubmission.findMany({
        where: { userId },
        select: { submittedAt: true },
      }),
      prisma.submission.findMany({
        where: { userId },
        select: { submittedAt: true },
      }),
      prisma.liveClassAttendance.findMany({
        where: { userId },
        select: { joinedAt: true },
      }),
    ]);

  const activityByDay = new Map<string, number>();
  const bump = (key: string) => activityByDay.set(key, (activityByDay.get(key) ?? 0) + 1);

  for (const { completedAt } of lectures) {
    if (completedAt) bump(toISTDateKey(completedAt));
  }
  for (const { submittedAt } of quizAttempts) {
    if (submittedAt) bump(toISTDateKey(submittedAt));
  }
  for (const { submittedAt } of projectSubmissions) {
    bump(toISTDateKey(submittedAt));
  }
  for (const { submittedAt } of submissions) {
    bump(toISTDateKey(submittedAt));
  }
  for (const { joinedAt } of liveClassAttendances) {
    bump(toISTDateKey(joinedAt));
  }

  return activityByDay;
}

export async function computeCurrentStreak(userId: string): Promise<number> {
  const activityByDay = await computeActivityByDay(userId);

  const todayKey = toISTDateKey(new Date());
  let cursor: string;
  if (activityByDay.has(todayKey)) {
    cursor = todayKey;
  } else {
    const yesterdayKey = daysBefore(todayKey, 1);
    if (activityByDay.has(yesterdayKey)) {
      cursor = yesterdayKey;
    } else {
      return 0;
    }
  }

  let streak = 0;
  while (activityByDay.has(cursor)) {
    streak++;
    cursor = daysBefore(cursor, 1);
  }
  return streak;
}
