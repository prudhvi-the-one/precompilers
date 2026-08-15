import Link from "next/link";
import { notFound } from "next/navigation";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { r2, R2_BUCKET } from "@/lib/r2";

export default async function RecordingReviewPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const mentor = await requireRole("MENTOR");
  if (!mentor) {
    return null;
  }

  const { attemptId } = await params;
  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: attemptId },
    include: { user: true, quiz: true },
  });
  if (!attempt || !attempt.recordingKey) {
    notFound();
  }

  const videoUrl = await getSignedUrl(
    r2,
    new GetObjectCommand({ Bucket: R2_BUCKET, Key: attempt.recordingKey }),
    { expiresIn: 3600 }
  );

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/recordings" className="text-sm text-ink-faint hover:text-ink">
        ← Recordings
      </Link>

      <div>
        <h1 className="font-brand text-xl font-bold text-ink">
          {attempt.user.name ?? attempt.user.email} · {attempt.quiz.title}
        </h1>
        <p className="text-sm text-ink-faint">
          Score: {attempt.score ?? "—"}% · Violations: {attempt.violationCount}
          {attempt.endedByViolation ? " · Force-submitted after a violation" : ""}
        </p>
      </div>

      <video controls src={videoUrl} className="w-full rounded-lg bg-black" />
    </div>
  );
}
