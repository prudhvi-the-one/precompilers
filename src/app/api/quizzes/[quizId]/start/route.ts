import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { meetsEntitlement } from "@/lib/entitlement";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ quizId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { quizId } = await params;
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { sections: { orderBy: { order: "asc" } } },
  });
  if (!quiz || quiz.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!meetsEntitlement(user.entitlement, quiz.requiredEntitlement)) {
    return NextResponse.json({ error: "Upgrade required" }, { status: 403 });
  }

  const existing = await prisma.quizAttempt.findFirst({
    where: { userId: user.id, quizId, submittedAt: null },
  });
  if (existing) {
    return NextResponse.json({ attemptId: existing.id });
  }

  let proctored = false;
  if (quiz.kind === "APTITUDE_PAPER") {
    const body = await request.json().catch(() => ({}));
    proctored = Boolean((body as { proctored?: boolean }).proctored);
  }

  const firstSection = quiz.sections[0];
  const attempt = await prisma.quizAttempt.create({
    data: {
      userId: user.id,
      quizId,
      proctored,
      sectionAttempts: firstSection
        ? { create: [{ sectionId: firstSection.id }] }
        : undefined,
    },
  });

  return NextResponse.json({ attemptId: attempt.id });
}
