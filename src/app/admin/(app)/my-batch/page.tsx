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
      <div className="mx-auto max-w-2xl rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
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
        <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-gray-900">
          {batch?.name} — {batch?.track.name}
        </h1>
        <p className="text-sm text-gray-500">{enrollments.length} students</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-2xl font-bold text-gray-900">
            {engagement.totalCount > 0
              ? Math.round((engagement.engagedCount / engagement.totalCount) * 100)
              : 0}
            %
          </p>
          <p className="text-xs text-gray-500">
            Engagement — {engagement.engagedCount} of {engagement.totalCount} active in the last 7
            days
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-2xl font-bold text-gray-900">
            {attendance.averageAttendancePct !== null ? `${attendance.averageAttendancePct}%` : "—"}
          </p>
          <p className="text-xs text-gray-500">
            {attendance.averageAttendancePct !== null
              ? "Average live-class attendance"
              : "Live-class attendance — not enough data yet"}
          </p>
        </div>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-3 font-brand text-base font-bold text-gray-900">Schedule live class</h2>
        <CreateLiveClassForm />
      </section>

      <section className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="font-brand text-base font-bold text-gray-900">Live classes</h2>
        </div>
        {liveClasses.length ? (
          <div className="divide-y divide-gray-100">
            {liveClasses.map((liveClass) => {
              const isPast = liveClass.scheduledAt <= new Date();
              return (
                <div
                  key={liveClass.id}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{liveClass.title}</p>
                    <p className="text-xs text-gray-500">{formatClassDate(liveClass.scheduledAt)}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {isPast
                      ? `${liveClass._count.attendances} of ${enrollments.length} attended`
                      : "Upcoming"}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="px-5 py-6 text-sm text-gray-500">No live classes scheduled yet.</p>
        )}
      </section>

      <section className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="font-brand text-base font-bold text-gray-900">Roster</h2>
        </div>
        {readinessScores.length ? (
          <div className="divide-y divide-gray-100">
            {readinessScores.map((s) => (
              <div key={s.userId} className="flex items-center justify-between px-5 py-3">
                <p className="text-sm font-medium text-gray-900">{s.name}</p>
                <span className="text-sm text-gray-600">
                  {s.readiness !== null ? `${s.readiness}/100` : "Not assessed yet"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="px-5 py-6 text-sm text-gray-500">No students enrolled yet.</p>
        )}
      </section>
    </div>
  );
}
