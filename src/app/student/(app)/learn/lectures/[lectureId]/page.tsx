import { redirect, notFound } from "next/navigation";
import { Lock } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { requireTierAccess } from "@/lib/tier";
import { prisma } from "@/lib/prisma";
import { meetsEntitlement } from "@/lib/entitlement";
import MarkCompleteButton from "@/components/learn/MarkCompleteButton";
import AngularBorder from "@/components/ui/AngularBorder";

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
      <a
        href="/learn"
        className="text-sm text-ink-faint hover:text-ink"
      >
        ← {lecture.track.name}
      </a>

      <h1 className="font-brand text-[22px] font-bold text-ink">
        {formatOrder(lecture.order)} · {lecture.title}
      </h1>

      {unlocked ? (
        <>
          <AngularBorder color="var(--line)" className="aspect-video overflow-hidden bg-black">
            <iframe
              src={lecture.videoUrl}
              title={lecture.title}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </AngularBorder>
          <p className="text-sm text-ink-muted">{lecture.description}</p>
          <MarkCompleteButton
            lectureId={lecture.id}
            initialCompleted={Boolean(progress?.completedAt)}
          />
        </>
      ) : (
        <AngularBorder color="var(--line)" className="bg-surface p-8 text-center">
          <p className="flex items-center justify-center gap-1.5 text-sm font-medium text-ink">
            <Lock className="h-4 w-4" strokeWidth={2} />
            This lesson needs a plan upgrade.
          </p>
          <p className="mt-1 text-sm text-ink-faint">
            The first lesson in every track is free to preview — this one
            unlocks with the Individual or Institution plan.
          </p>
          <a
            href="/learn"
            className="mt-4 inline-block text-sm font-semibold text-accent hover:underline"
          >
            Back to Skill tracks
          </a>
        </AngularBorder>
      )}
    </div>
  );
}

function formatOrder(order: number): string {
  return String(order).padStart(2, "0");
}
