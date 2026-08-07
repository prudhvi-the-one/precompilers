import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function LecturesPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId: user.id },
    include: { track: { include: { lectures: { orderBy: { order: "asc" } } } } },
  });

  const completedIds = enrollment
    ? new Set(
        (
          await prisma.lectureProgress.findMany({
            where: {
              userId: user.id,
              lectureId: { in: enrollment.track.lectures.map((l) => l.id) },
              completedAt: { not: null },
            },
          })
        ).map((p) => p.lectureId)
      )
    : new Set<string>();

  return (
    <div className="max-w-3xl space-y-4">
      <div>
        <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-[#0F1020]">
          Lectures
        </h1>
        <p className="text-[14.5px] text-[#55556B]">
          {enrollment
            ? `Every lecture in ${enrollment.track.name}.`
            : "Pick a track to see its lectures here."}
        </p>
      </div>

      {enrollment ? (
        <div className="divide-y divide-[#F2F2F7] rounded-xl border border-[#E6E6EF] bg-white">
          {enrollment.track.lectures.map((lecture) => (
            <Link
              key={lecture.id}
              href={`/learn/lectures/${lecture.id}`}
              className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#FBFBFD]"
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs ${
                  completedIds.has(lecture.id)
                    ? "bg-[#E7F7F0] text-[#059669]"
                    : "border border-[#DDDDE7]"
                }`}
              >
                {completedIds.has(lecture.id) ? "✓" : ""}
              </span>
              <span className="flex-1 text-sm text-[#0F1020]">
                {lecture.title}
              </span>
              <span className="text-xs text-[#9A9AAE]">
                {lecture.durationMinutes} min
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <Link
          href="/onboarding"
          className="text-sm font-semibold text-indigo-600 hover:underline"
        >
          Set your track
        </Link>
      )}
    </div>
  );
}
