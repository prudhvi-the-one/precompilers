import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { requireTierAccess } from "@/lib/tier";
import { prisma } from "@/lib/prisma";
import BookCounsellingSlot from "@/components/career/BookCounsellingSlot";

function formatSlotTime(date: Date): string {
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
}

export default async function CounsellingPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  await requireTierAccess(user, "CAREER");

  const [openSlots, pastSessions] = await Promise.all([
    prisma.mentorAvailability.findMany({
      where: { isBooked: false, startsAt: { gte: new Date() } },
      include: { mentor: { include: { user: true } } },
      orderBy: { startsAt: "asc" },
      take: 10,
    }),
    prisma.mentorSession.findMany({
      where: { studentId: user.id, kind: "COUNSELLING" },
      include: { mentor: { include: { user: true } }, slot: true },
      orderBy: { slot: { startsAt: "desc" } },
    }),
  ]);

  return (
    <div className="max-w-3xl space-y-4">
      <div>
        <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-ink">
          Counselling
        </h1>
        <p className="text-[14.5px] text-ink-muted">
          Book a one-on-one session with a mentor for career guidance — not scored,
          just advice.
        </p>
      </div>

      <div className="rounded-xl border border-line bg-surface">
        <div className="border-b border-line-soft px-5 py-3.5">
          <h2 className="font-brand text-base font-bold text-ink">Book a session</h2>
        </div>
        {openSlots.length ? (
          <div className="divide-y divide-line-soft">
            {openSlots.map((slot) => (
              <div key={slot.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                <div>
                  <p className="text-sm font-medium text-ink">
                    {slot.mentor.user.name ?? slot.mentor.user.email}
                  </p>
                  <p className="text-xs text-ink-faint">
                    {formatSlotTime(slot.startsAt)} · {slot.durationMinutes} min
                    {slot.mentor.specializations.length
                      ? ` · ${slot.mentor.specializations.join(", ")}`
                      : ""}
                  </p>
                </div>
                <BookCounsellingSlot slotId={slot.id} />
              </div>
            ))}
          </div>
        ) : (
          <p className="px-5 py-4 text-sm text-ink-faint">No mentor slots open right now.</p>
        )}
      </div>

      <div className="rounded-xl border border-line bg-surface">
        <div className="border-b border-line-soft px-5 py-3.5">
          <h2 className="font-brand text-sm font-bold text-ink">Past sessions</h2>
        </div>
        {pastSessions.length === 0 ? (
          <p className="px-5 py-4 text-sm text-ink-faint">No counselling sessions yet.</p>
        ) : (
          <div className="divide-y divide-line-soft">
            {pastSessions.map((session) => (
              <div key={session.id} className="px-5 py-4">
                <p className="text-sm font-medium text-ink">
                  {session.mentor.user.name ?? session.mentor.user.email}
                </p>
                <p className="text-xs text-ink-faint">{formatSlotTime(session.slot.startsAt)}</p>
                {session.notes ? (
                  <p className="mt-2 rounded-lg bg-surface-sunk px-3 py-2 text-sm text-ink-secondary">
                    {session.notes}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-ink-faint">Awaiting notes from your mentor.</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
