import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { requireTierAccess } from "@/lib/tier";
import { prisma } from "@/lib/prisma";

function formatSchedule(date: Date): string {
  return date.toLocaleString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
}

export default async function GroupDiscussionsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  await requireTierAccess(user, "PROVE");

  const sessions = await prisma.gdSession.findMany({
    orderBy: { scheduledAt: "asc" },
    include: { _count: { select: { participants: true } } },
  });

  return (
    <div className="max-w-3xl space-y-4">
      <Link href="/prove" className="text-sm text-ink-faint hover:text-ink">
        ← Prove
      </Link>
      <div>
        <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-ink">
          Group discussions
        </h1>
        <p className="text-[14.5px] text-ink-muted">
          Peer-run, no mentor cost. Scored on airtime, not just talking the most.
        </p>
      </div>

      <div className="divide-y divide-line-soft rounded-xl border border-line bg-surface">
        {sessions.map((session) => (
          <div key={session.id} className="flex items-center justify-between gap-3 px-5 py-4">
            <div>
              <p className="text-sm font-medium text-ink">
                &quot;{session.topic}&quot;
              </p>
              <p className="text-xs text-ink-faint">
                {formatSchedule(session.scheduledAt)} · {session._count.participants} joined
                so far · starts with {session.minParticipants} or more
              </p>
            </div>
            <Link
              href={`/gd-room/${session.id}`}
              className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-accent-hover"
            >
              Join
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
