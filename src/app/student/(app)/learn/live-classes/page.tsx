import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

function formatSchedule(date: Date): string {
  return date.toLocaleString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export default async function LiveClassesPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId: user.id },
    include: {
      track: true,
      batch: { include: { liveClasses: { orderBy: { scheduledAt: "asc" } } } },
    },
  });

  return (
    <div className="max-w-3xl space-y-4">
      <div>
        <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-[#0F1020]">
          Live classes
        </h1>
        <p className="text-[14.5px] text-[#55556B]">
          {enrollment
            ? `Upcoming sessions for ${enrollment.track.name}.`
            : "Pick a track to see its live class schedule."}
        </p>
      </div>

      {enrollment?.batch?.liveClasses.length ? (
        <div className="divide-y divide-[#F2F2F7] rounded-xl border border-[#E6E6EF] bg-white">
          {enrollment.batch.liveClasses.map((liveClass) => (
            <div
              key={liveClass.id}
              className="flex items-center justify-between gap-3 px-5 py-4"
            >
              <div>
                <p className="text-sm font-medium text-[#0F1020]">
                  {liveClass.title}
                </p>
                <p className="text-xs text-[#8A8AA0]">
                  {formatSchedule(liveClass.scheduledAt)} ·{" "}
                  {liveClass.durationMinutes} min
                </p>
              </div>
              <a
                href={liveClass.joinUrl}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 font-brand text-[13px] font-semibold text-white hover:bg-[#4338CA]"
              >
                Join class
              </a>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-[#E6E6EF] bg-white p-6 text-center text-sm text-[#55556B]">
          {enrollment
            ? "No live classes scheduled yet for this batch."
            : "Set your track to see upcoming live classes."}
        </div>
      )}
    </div>
  );
}
