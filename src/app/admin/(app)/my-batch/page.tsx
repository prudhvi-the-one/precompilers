import { redirect } from "next/navigation";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { computeOverallReadiness } from "@/lib/readiness";
import { computeEngagement } from "@/lib/cohort";
import { computeAttendanceStats } from "@/lib/attendance";
import CreateLiveClassForm from "@/components/admin/CreateLiveClassForm";

function formatClassDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
}

export default async function MyBatchPage() {
  const user = await requireRole("FACULTY");
  if (!user) {
    redirect("/login");
  }
  if (!user.facultyBatchId) {
    return (
      <div className="mx-auto max-w-2xl rounded-xl border border-line bg-surface p-6 text-sm text-ink-muted">
        No batch has been assigned to your account yet — ask your institution admin.
      </div>
    );
  }

  const batch = await prisma.batch.findUnique({
    where: { id: user.facultyBatchId },
    include: { track: true },
  });
  const enrollments = await prisma.enrollment.findMany({
    where: { batchId: user.facultyBatchId },
    include: { user: true },
  });
  const studentIds = enrollments.map((e) => e.userId);

  const [readinessScores, engagement, attendance, liveClasses] = await Promise.all([
    Promise.all(
      enrollments.map(async (e) => ({
        userId: e.userId,
        name: e.user.name ?? e.user.email,
        readiness: await computeOverallReadiness(e.userId),
      }))
    ),
    computeEngagement(studentIds),
    computeAttendanceStats(studentIds),
    prisma.liveClass.findMany({
      where: { batchId: user.facultyBatchId },
      orderBy: { scheduledAt: "desc" },
      include: { _count: { select: { attendances: true } } },
    }),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-ink">
          {batch?.name} — {batch?.track.name}
        </h1>
        <p className="text-sm text-ink-faint">{enrollments.length} students</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-line bg-surface p-4">
          <p className="text-2xl font-bold text-ink">
            {engagement.totalCount > 0
              ? Math.round((engagement.engagedCount / engagement.totalCount) * 100)
              : 0}
            %
          </p>
          <p className="text-xs text-ink-faint">
            Engagement — {engagement.engagedCount} of {engagement.totalCount} active in the last 7
            days
          </p>
        </div>
        <div className="rounded-xl border border-line bg-surface p-4">
          <p className="text-2xl font-bold text-ink">
            {attendance.averageAttendancePct !== null ? `${attendance.averageAttendancePct}%` : "—"}
          </p>
          <p className="text-xs text-ink-faint">
            {attendance.averageAttendancePct !== null
              ? "Average live-class attendance"
              : "Live-class attendance — not enough data yet"}
          </p>
        </div>
      </div>

      <section className="rounded-xl border border-line bg-surface p-5">
        <h2 className="mb-3 font-brand text-base font-bold text-ink">Schedule live class</h2>
        <CreateLiveClassForm />
      </section>

      <section className="rounded-xl border border-line bg-surface">
        <div className="border-b border-line-soft px-5 py-4">
          <h2 className="font-brand text-base font-bold text-ink">Live classes</h2>
        </div>
        {liveClasses.length ? (
          <div className="divide-y divide-line-soft">
            {liveClasses.map((liveClass) => {
              const isPast = liveClass.scheduledAt <= new Date();
              return (
                <div
                  key={liveClass.id}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-ink">{liveClass.title}</p>
                    <p className="text-xs text-ink-faint">{formatClassDate(liveClass.scheduledAt)}</p>
                  </div>
                  <span className="text-xs text-ink-faint">
                    {isPast
                      ? `${liveClass._count.attendances} of ${enrollments.length} attended`
                      : "Upcoming"}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="px-5 py-6 text-sm text-ink-faint">No live classes scheduled yet.</p>
        )}
      </section>

      <section className="rounded-xl border border-line bg-surface">
        <div className="border-b border-line-soft px-5 py-4">
          <h2 className="font-brand text-base font-bold text-ink">Roster</h2>
        </div>
        {readinessScores.length ? (
          <div className="divide-y divide-line-soft">
            {readinessScores.map((s) => (
              <div key={s.userId} className="flex items-center justify-between px-5 py-3">
                <p className="text-sm font-medium text-ink">{s.name}</p>
                <span className="text-sm text-ink-muted">
                  {s.readiness !== null ? `${s.readiness}/100` : "Not assessed yet"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="px-5 py-6 text-sm text-ink-faint">No students enrolled yet.</p>
        )}
      </section>
    </div>
  );
}
