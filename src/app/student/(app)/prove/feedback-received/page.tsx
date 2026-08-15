import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { requireTierAccess } from "@/lib/tier";
import { prisma } from "@/lib/prisma";

const HIRE_LABEL: Record<string, string> = {
  NOT_YET: "Not yet",
  CLOSE: "Close",
  YES: "Yes",
};

export default async function FeedbackReceivedPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  await requireTierAccess(user, "PROVE");

  const submissions = await prisma.projectSubmission.findMany({
    where: { userId: user.id },
    include: { project: true, reviews: true },
    orderBy: { submittedAt: "desc" },
  });

  return (
    <div className="max-w-3xl space-y-4">
      <Link href="/prove" className="text-sm text-ink-faint hover:text-ink">
        ← Prove
      </Link>
      <div>
        <h1 className="font-brand text-[25px] font-bold tracking-[-0.02em] text-ink">
          Feedback received
        </h1>
        <p className="text-[14.5px] text-ink-muted">
          Reviews stay anonymous — you&apos;ll never see who wrote one.
        </p>
      </div>

      {submissions.length === 0 ? (
        <div className="rounded-xl border border-line bg-surface p-6 text-center text-sm text-ink-muted">
          You haven&apos;t submitted a project yet.{" "}
          <Link href="/prove/projects" className="font-semibold text-indigo-600 hover:underline">
            Pick a brief
          </Link>
          .
        </div>
      ) : (
        submissions.map((submission) => (
          <div key={submission.id} className="rounded-xl border border-line bg-surface">
            <div className="border-b border-line-soft px-5 py-3.5">
              <h2 className="font-brand text-sm font-bold text-ink">
                {submission.project.title}
              </h2>
            </div>
            {submission.reviews.length === 0 ? (
              <p className="px-5 py-4 text-sm text-ink-faint">
                No reviews yet.
              </p>
            ) : (
              <div className="divide-y divide-line-soft">
                {submission.reviews.map((review) => (
                  <div key={review.id} className="px-5 py-4">
                    <div className="flex flex-wrap gap-3 text-xs text-ink-faint">
                      <span>Correctness {review.correctness}/5</span>
                      <span>Efficiency {review.efficiency}/5</span>
                      <span>Readability {review.readability}/5</span>
                      <span>Would hire: {HIRE_LABEL[review.wouldHire]}</span>
                    </div>
                    <p className="mt-1.5 text-sm text-ink">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
