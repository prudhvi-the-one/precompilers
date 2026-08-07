import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { submitSectionAndAdvance } from "@/lib/quiz";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ attemptId: string; sectionId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { attemptId, sectionId } = await params;
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

  const sectionAttempt = await prisma.sectionAttempt.findUnique({
    where: { attemptId_sectionId: { attemptId, sectionId } },
  });
  if (!sectionAttempt || sectionAttempt.submittedAt) {
    return NextResponse.json(
      { error: "Section already submitted" },
      { status: 409 }
    );
  }

  const result = await submitSectionAndAdvance(attemptId, sectionId);
  return NextResponse.json(result);
}
