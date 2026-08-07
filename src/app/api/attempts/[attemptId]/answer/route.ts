import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { isSectionExpired } from "@/lib/quiz";

export async function POST(
  request: Request,
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
    return NextResponse.json(
      { error: "Attempt already submitted" },
      { status: 409 }
    );
  }

  const body = (await request.json()) as {
    questionId: string;
    selectedOptionId?: string | null;
    flagged?: boolean;
  };

  const question = await prisma.question.findUnique({
    where: { id: body.questionId },
    include: { section: true },
  });
  if (!question) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const sectionAttempt = await prisma.sectionAttempt.findUnique({
    where: {
      attemptId_sectionId: { attemptId, sectionId: question.sectionId },
    },
  });
  if (!sectionAttempt || sectionAttempt.submittedAt) {
    return NextResponse.json({ error: "Section closed" }, { status: 409 });
  }
  if (isSectionExpired(sectionAttempt, question.section.durationMinutes)) {
    return NextResponse.json(
      { error: "Section time expired" },
      { status: 409 }
    );
  }

  await prisma.questionResponse.upsert({
    where: {
      attemptId_questionId: { attemptId, questionId: body.questionId },
    },
    update: {
      ...(body.selectedOptionId !== undefined
        ? { selectedOptionId: body.selectedOptionId }
        : {}),
      ...(body.flagged !== undefined ? { flagged: body.flagged } : {}),
      seen: true,
    },
    create: {
      attemptId,
      questionId: body.questionId,
      selectedOptionId: body.selectedOptionId ?? null,
      flagged: body.flagged ?? false,
      seen: true,
    },
  });

  return NextResponse.json({ success: true });
}
