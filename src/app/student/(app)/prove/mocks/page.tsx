import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { requireTierAccess } from "@/lib/tier";
import { prisma } from "@/lib/prisma";
import MockPoolStatus from "@/components/prove/MockPoolStatus";
import BookMentorSlot from "@/components/prove/BookMentorSlot";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

function formatSlotTime(date: Date): string {
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
}

export default async function MocksPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  await requireTierAccess(user, "PROVE");

  const myRequests = await prisma.mockRequest.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { feedbackGiven: true },
  });
  const active = myRequests.find((r) => !r.pairedWithId || r.feedbackGiven.length === 0);

  const feedbackReceived = await prisma.mockFeedback.findMany({
    where: { rateeId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const candidateSlots = await prisma.mentorAvailability.findMany({
    where: { isBooked: false, startsAt: { gte: new Date() } },
    include: { mentor: { include: { user: true } } },
    orderBy: { startsAt: "asc" },
    take: 50,
  });

  const preferredMentorIds = user.institutionId
    ? new Set(
        (
          await prisma.institutionPreferredMentor.findMany({
            where: { institutionId: user.institutionId },
            select: { mentorId: true },
          })
        ).map((p) => p.mentorId)
      )
    : new Set<string>();

  const openSlots = [
    ...candidateSlots.filter((s) => preferredMentorIds.has(s.mentorId)),
    ...candidateSlots.filter((s) => !preferredMentorIds.has(s.mentorId)),
  ].slice(0, 10);

  return (
    <div className="max-w-3xl space-y-4">
      <Link href="/prove" className="text-sm text-ink-faint hover:text-ink">
        ← Prove
      </Link>
      <div>
        <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-ink">
          Mock interviews
        </h1>
        <p className="text-[14.5px] text-ink-muted">
          Book a real mentor, or pair with a peer — free and unlimited.
        </p>
      </div>

      <div className="rounded-xl border border-line bg-surface">
        <div className="border-b border-line-soft px-5 py-3.5">
          <h2 className="font-brand text-base font-bold text-ink">With a mentor</h2>
          <p className="text-xs text-ink-faint">
            Book a slot for a mock interview, HR round, or counselling — real
            mentors, verified feedback.
          </p>
        </div>
        {openSlots.length ? (
          <div className="divide-y divide-line-soft">
            {openSlots.map((slot) => (
              <div key={slot.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                <div>
                  <p className="text-sm font-medium text-ink">
                    {slot.mentor.user.name ?? slot.mentor.user.email}
                    {preferredMentorIds.has(slot.mentorId) ? (
                      <span className="ml-2 rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-semibold text-indigo-600">
                        Preferred by your college
                      </span>
                    ) : null}
                  </p>
                  <p className="text-xs text-ink-faint">
                    {formatSlotTime(slot.startsAt)} · {slot.durationMinutes} min
                    {slot.mentor.specializations.length
                      ? ` · ${slot.mentor.specializations.join(", ")}`
                      : ""}
                  </p>
                </div>
                <BookMentorSlot slotId={slot.id} />
              </div>
            ))}
          </div>
        ) : (
          <p className="px-5 py-4 text-sm text-ink-faint">No mentor slots open right now.</p>
        )}
      </div>

      <div className="rounded-xl border border-[#DDD9FB] bg-accent-soft p-5">
        <h2 className="font-brand text-base font-bold text-ink">With a peer</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Paired with another student. You interview them, they interview you.
        </p>
        <div className="mt-3">
          <MockPoolStatus
            initialRequestId={active?.id ?? null}
            initialPaired={Boolean(active?.pairedWithId)}
          />
        </div>
      </div>

      <div className="rounded-xl border border-line bg-surface">
        <div className="border-b border-line-soft px-5 py-3.5">
          <h2 className="font-brand text-sm font-bold text-ink">Past mocks</h2>
        </div>
        {feedbackReceived.length === 0 ? (
          <p className="px-5 py-4 text-sm text-ink-faint">No mocks completed yet.</p>
        ) : (
          <div className="divide-y divide-line-soft">
            {feedbackReceived.map((fb) => (
              <div key={fb.id} className="flex items-center gap-4 px-5 py-4">
                <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-accent-soft font-brand text-sm font-bold text-indigo-600">
                  {fb.score}
                  <span className="text-[9px] font-normal text-ink-faintest">/5</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-ink">
                    Peer mock · anonymous
                  </p>
                  <p className="text-xs text-ink-faint">
                    {formatDate(fb.createdAt)} · &quot;{fb.quote}&quot;
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
