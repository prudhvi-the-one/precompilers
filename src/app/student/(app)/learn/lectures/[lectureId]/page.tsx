import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { requireTierAccess } from "@/lib/tier";
import { prisma } from "@/lib/prisma";
import { meetsEntitlement } from "@/lib/entitlement";
import MarkCompleteButton from "@/components/learn/MarkCompleteButton";

export default async function LectureDetailPage({
  params,
}: {
  params: Promise<{ lectureId: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  await requireTierAccess(user, "LEARN");

  const { lectureId } = await params;

  const lecture = await prisma.lecture.findUnique({
    where: { id: lectureId },
    include: { track: { include: { lectures: { orderBy: { order: "asc" } } } } },
  });
  if (!lecture) {
    notFound();
  }

  const isFirstLecture = lecture.track.lectures[0]?.id === lecture.id;
  const unlocked =
    meetsEntitlement(user.entitlement, lecture.track.requiredEntitlement) ||
    isFirstLecture;

  const progress = await prisma.lectureProgress.findUnique({
    where: { userId_lectureId: { userId: user.id, lectureId: lecture.id } },
  });

  return (
    <div className="max-w-3xl space-y-4">
      <Link
        href="/learn"
        className="text-sm text-ink-faint hover:text-ink"
      >
        ← {lecture.track.name}
      </Link>

      <h1 className="font-brand text-[22px] font-bold text-ink">
        {formatOrder(lecture.order)} · {lecture.title}
      </h1>

      {unlocked ? (
        <>
          <div className="aspect-video overflow-hidden rounded-xl border border-line bg-black">
            <iframe
              src={lecture.videoUrl}
              title={lecture.title}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <p className="text-sm text-ink-muted">{lecture.description}</p>
          <MarkCompleteButton
            lectureId={lecture.id}
            initialCompleted={Boolean(progress?.completedAt)}
          />
        </>
      ) : (
        <div className="rounded-xl border border-line bg-surface p-8 text-center">
          <p className="text-sm font-medium text-ink">
            🔒 This lesson needs a plan upgrade.
          </p>
          <p className="mt-1 text-sm text-ink-faint">
            The first lesson in every track is free to preview — this one
            unlocks with the Individual or Institution plan.
          </p>
          <Link
            href="/learn"
            className="mt-4 inline-block text-sm font-semibold text-indigo-600 hover:underline"
          >
            Back to Skill tracks
          </Link>
        </div>
      )}
    </div>
  );
}

function formatOrder(order: number): string {
  return String(order).padStart(2, "0");
}
