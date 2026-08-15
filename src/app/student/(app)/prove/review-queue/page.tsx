import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { requireTierAccess } from "@/lib/tier";
import { prisma } from "@/lib/prisma";
import PeerReviewForm from "@/components/prove/PeerReviewForm";

function hoursUntil(date: Date): number {
  return Math.max(0, Math.round((date.getTime() - Date.now()) / 3_600_000));
}

export default async function ReviewQueuePage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  await requireTierAccess(user, "PROVE");

  const candidates = await prisma.projectSubmission.findMany({
    where: {
      userId: { not: user.id },
      reviews: { none: { reviewerId: user.id } },
    },
    orderBy: { submittedAt: "asc" },
    take: 20,
    include: { _count: { select: { reviews: true } }, project: true },
  });
  const next = candidates.find((s) => s._count.reviews < 2);

  return (
    <div className="max-w-3xl space-y-4">
      <Link href="/prove" className="text-sm text-ink-faint hover:text-ink">
        ← Prove
      </Link>

      {next ? (
        <>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-brand text-[22px] font-bold text-ink">
                Reviewing: {next.project.title}
              </h1>
              <span className="rounded-full bg-warn-soft px-2.5 py-0.5 font-mono text-[10px] font-semibold text-warn">
                DUE IN {hoursUntil(new Date(next.submittedAt.getTime() + 48 * 3_600_000))}H
              </span>
            </div>
            <p className="text-[13.5px] text-ink-faint">
              Anonymous — you&apos;ll see the author after you submit.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div className="space-y-3 rounded-xl border border-line bg-surface p-5">
              <p className="text-sm font-medium text-ink">Submission</p>
              <a
                href={next.submissionUrl}
                target="_blank"
                rel="noreferrer"
                className="block truncate text-sm font-semibold text-indigo-600 hover:underline"
              >
                {next.submissionUrl}
              </a>
              <p className="whitespace-pre-line text-sm text-ink-muted">
                {next.description}
              </p>
            </div>

            <div className="rounded-xl border border-line bg-surface p-5">
              <PeerReviewForm submissionId={next.id} />
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-line bg-surface p-8 text-center">
          <p className="text-sm font-medium text-ink">
            Nothing to review right now.
          </p>
          <p className="mt-1 text-sm text-ink-faint">
            Every current submission already has two reviews. Check back once
            more students submit.
          </p>
        </div>
      )}
    </div>
  );
}
