import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { forceSubmitAllRemainingSections } from "@/lib/quiz";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { attemptId } = await params;
  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: attemptId },
  });
  if (!attempt || attempt.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (attempt.submittedAt) {
    return NextResponse.json({
      ended: true,
      violationCount: attempt.violationCount,
    });
  }
  if (!attempt.proctored) {
    return NextResponse.json({ ended: false, violationCount: 0 });
  }

  const updated = await prisma.quizAttempt.update({
    where: { id: attemptId },
    data: { violationCount: { increment: 1 } },
  });

  if (updated.violationCount >= 2) {
    await forceSubmitAllRemainingSections(attemptId);
    return NextResponse.json({
      ended: true,
      violationCount: updated.violationCount,
    });
  }

  return NextResponse.json({
    ended: false,
    violationCount: updated.violationCount,
  });
}
