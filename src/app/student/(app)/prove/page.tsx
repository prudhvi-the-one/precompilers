import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { requireTierAccess } from "@/lib/tier";
import { prisma } from "@/lib/prisma";

export default async function ProvePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  await requireTierAccess(user, "PROVE");

  const [pendingReviewCount, mySubmissionCount, upcomingGd, myMockRequest] =
    await Promise.all([
      prisma.projectSubmission.count({
        where: {
          userId: { not: user.id },
          reviews: { none: { reviewerId: user.id } },
        },
      }),
      prisma.projectSubmission.count({ where: { userId: user.id } }),
      prisma.gdSession.findFirst({
        where: { scheduledAt: { gt: new Date() } },
        orderBy: { scheduledAt: "asc" },
      }),
      prisma.mockRequest.findFirst({
        where: { userId: user.id, pairedWithId: { not: null } },
        orderBy: { createdAt: "desc" },
      }),
    ]);

  return (
    <div className="max-w-3xl space-y-4">
      <div>
        <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-ink">
          Prove
        </h1>
        <p className="text-[14.5px] text-ink-muted">
          Peer review, mock interviews, and group discussions.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/prove/projects"
          className="rounded-xl border border-line bg-surface p-5 hover:bg-surface-sunk"
        >
          <h2 className="font-brand text-base font-bold text-ink">Project briefs</h2>
          <p className="mt-1 text-sm text-ink-muted">
            {mySubmissionCount > 0
              ? `${mySubmissionCount} submitted`
              : "Pick a brief and ship it"}
          </p>
        </Link>
        <Link
          href="/prove/review-queue"
          className="rounded-xl border border-line bg-surface p-5 hover:bg-surface-sunk"
        >
          <h2 className="font-brand text-base font-bold text-ink">Review queue</h2>
          <p className="mt-1 text-sm text-ink-muted">
            {pendingReviewCount > 0
              ? `${pendingReviewCount} awaiting review`
              : "Nothing to review right now"}
          </p>
        </Link>
        <Link
          href="/prove/mocks"
          className="rounded-xl border border-line bg-surface p-5 hover:bg-surface-sunk"
        >
          <h2 className="font-brand text-base font-bold text-ink">Mock interviews</h2>
          <p className="mt-1 text-sm text-ink-muted">
            {myMockRequest
              ? "You have a paired mock"
              : "Join the peer pool, free and unlimited"}
          </p>
        </Link>
        <Link
          href="/prove/group-discussions"
          className="rounded-xl border border-line bg-surface p-5 hover:bg-surface-sunk"
        >
          <h2 className="font-brand text-base font-bold text-ink">Group discussions</h2>
          <p className="mt-1 text-sm text-ink-muted">
            {upcomingGd
              ? `Next: "${upcomingGd.topic}"`
              : "No sessions scheduled"}
          </p>
        </Link>
      </div>
    </div>
  );
}
