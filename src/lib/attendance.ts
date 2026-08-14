import { prisma } from "@/lib/prisma";

export type AttendanceStats = {
  averageAttendancePct: number | null;
  studentCount: number;
};

// Per-student attendance is scoped to their own batch's held classes
// (scheduledAt in the past) — a batch with zero held classes yet is
// excluded from the average, not counted as 0%, matching the
// "not started ≠ zero" convention used throughout readiness.ts.
export async function computeAttendanceStats(userIds: string[]): Promise<AttendanceStats> {
  if (userIds.length === 0) {
    return { averageAttendancePct: null, studentCount: 0 };
  }

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: { in: userIds } },
    select: { userId: true, batchId: true },
  });
  const batchIds = [...new Set(enrollments.map((e) => e.batchId).filter((id): id is string => id !== null))];

  if (batchIds.length === 0) {
    return { averageAttendancePct: null, studentCount: userIds.length };
  }

  const heldClasses = await prisma.liveClass.findMany({
    where: { batchId: { in: batchIds }, scheduledAt: { lte: new Date() } },
    select: { id: true, batchId: true },
  });

  const classIdsByBatch = new Map<string, string[]>();
  for (const c of heldClasses) {
    classIdsByBatch.set(c.batchId, [...(classIdsByBatch.get(c.batchId) ?? []), c.id]);
  }

  const attendance = await prisma.liveClassAttendance.findMany({
    where: { liveClassId: { in: heldClasses.map((c) => c.id) }, userId: { in: userIds } },
    select: { userId: true, liveClassId: true },
  });
  const attendedSet = new Set(attendance.map((a) => `${a.userId}:${a.liveClassId}`));

  const batchByUser = new Map(enrollments.map((e) => [e.userId, e.batchId]));
  const pcts: number[] = [];
  for (const userId of userIds) {
    const batchId = batchByUser.get(userId);
    const classIds = batchId ? classIdsByBatch.get(batchId) ?? [] : [];
    if (classIds.length === 0) {
      continue;
    }
    const attended = classIds.filter((id) => attendedSet.has(`${userId}:${id}`)).length;
    pcts.push((attended / classIds.length) * 100);
  }

  if (pcts.length === 0) {
    return { averageAttendancePct: null, studentCount: userIds.length };
  }
  return {
    averageAttendancePct: Math.round(pcts.reduce((sum, v) => sum + v, 0) / pcts.length),
    studentCount: userIds.length,
  };
}

export type BatchAttendanceSession = {
  liveClassId: string;
  title: string;
  scheduledAt: Date;
  totalEnrolled: number;
  presentCount: number;
  pctPresent: number;
  attendees: { name: string | null; email: string }[];
};

export type BatchAttendanceRegister = {
  sessions: BatchAttendanceSession[];
  perStudent: { userId: string; name: string | null; email: string; pctPresent: number | null }[];
};

// Full per-session roster + per-student overall percentage for a single
// batch — the data backbone of the accreditation pack's attendance register.
export async function computeBatchAttendanceRegister(
  batchId: string
): Promise<BatchAttendanceRegister> {
  const [enrollments, heldClasses] = await Promise.all([
    prisma.enrollment.findMany({ where: { batchId }, include: { user: true } }),
    prisma.liveClass.findMany({
      where: { batchId, scheduledAt: { lte: new Date() } },
      orderBy: { scheduledAt: "asc" },
      include: {
        attendances: { include: { user: true } },
      },
    }),
  ]);

  const totalEnrolled = enrollments.length;
  const sessions: BatchAttendanceSession[] = heldClasses.map((liveClass) => ({
    liveClassId: liveClass.id,
    title: liveClass.title,
    scheduledAt: liveClass.scheduledAt,
    totalEnrolled,
    presentCount: liveClass.attendances.length,
    pctPresent:
      totalEnrolled > 0 ? Math.round((liveClass.attendances.length / totalEnrolled) * 100) : 0,
    attendees: liveClass.attendances.map((a) => ({ name: a.user.name, email: a.user.email })),
  }));

  const attendedCountByUser = new Map<string, number>();
  for (const liveClass of heldClasses) {
    for (const a of liveClass.attendances) {
      attendedCountByUser.set(a.userId, (attendedCountByUser.get(a.userId) ?? 0) + 1);
    }
  }

  const perStudent = enrollments.map((e) => ({
    userId: e.userId,
    name: e.user.name,
    email: e.user.email,
    pctPresent:
      heldClasses.length > 0
        ? Math.round(((attendedCountByUser.get(e.userId) ?? 0) / heldClasses.length) * 100)
        : null,
  }));

  return { sessions, perStudent };
}
