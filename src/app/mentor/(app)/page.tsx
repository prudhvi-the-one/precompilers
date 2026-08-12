import Link from "next/link";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import AddAvailabilityForm from "@/components/mentor/AddAvailabilityForm";

const KIND_LABEL: Record<string, string> = {
  MOCK: "Mock interview",
  HR_ROUND: "HR round",
  COUNSELLING: "Counselling",
};

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
}

export default async function MentorDashboardPage() {
  const mentor = await requireRole("MENTOR");
  if (!mentor) {
    return null; // layout already redirects; this satisfies TypeScript
  }

  const mentorProfile = await prisma.mentorProfile.findUnique({
    where: { userId: mentor.id },
  });
  if (!mentorProfile) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
        No mentor profile is set up for this account yet.
      </div>
    );
  }

  const [sessions, slots] = await Promise.all([
    prisma.mentorSession.findMany({
      where: { mentorId: mentorProfile.id, status: "BOOKED" },
      include: { student: true, slot: true },
      orderBy: { slot: { startsAt: "asc" } },
    }),
    prisma.mentorAvailability.findMany({
      where: { mentorId: mentorProfile.id, startsAt: { gte: new Date() } },
      orderBy: { startsAt: "asc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-gray-900">
          Mentor dashboard
        </h1>
        <p className="text-sm text-gray-500">
          {mentorProfile.capacityPerDay} sessions/day capacity ·{" "}
          {mentorProfile.specializations.join(", ")}
        </p>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="font-brand text-base font-bold text-gray-900">
            Upcoming sessions
          </h2>
        </div>
        {sessions.length ? (
          <div className="divide-y divide-gray-100">
            {sessions.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {KIND_LABEL[s.kind]} with {s.student.name ?? s.student.email}
                  </p>
                  <p className="text-xs text-gray-500">{formatDate(s.slot.startsAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  {s.roomUrl ? (
                    <Link
                      href={`/mentor-session/${s.id}`}
                      className="rounded-md bg-black px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      Join room
                    </Link>
                  ) : null}
                  <Link
                    href={`/sessions/${s.id}/wrap-up`}
                    className="text-xs font-semibold text-indigo-600 hover:underline"
                  >
                    {s.kind === "COUNSELLING" ? "Add notes" : "Submit scorecard"}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="px-5 py-6 text-sm text-gray-500">No sessions booked yet.</p>
        )}
      </section>

      <section className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="font-brand text-base font-bold text-gray-900">Your availability</h2>
        </div>
        <div className="px-5 py-4">
          <AddAvailabilityForm />
        </div>
        {slots.length ? (
          <div className="divide-y divide-gray-100">
            {slots.map((slot) => (
              <div key={slot.id} className="flex items-center justify-between px-5 py-3">
                <span className="text-sm text-gray-700">
                  {formatDate(slot.startsAt)} · {slot.durationMinutes} min
                </span>
                <span
                  className={
                    slot.isBooked
                      ? "rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700"
                      : "rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-500"
                  }
                >
                  {slot.isBooked ? "Booked" : "Open"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="px-5 py-4 text-sm text-gray-500">No upcoming slots yet.</p>
        )}
      </section>
    </div>
  );
}
