import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { attemptId } = await params;
  const body = (await request.json().catch(() => ({}))) as { key?: string };
  if (!body.key || body.key !== `recordings/${attemptId}.webm`) {
    return NextResponse.json({ error: "Invalid key" }, { status: 400 });
  }

  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: attemptId },
  });
  if (!attempt || attempt.userId !== session.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.quizAttempt.update({
    where: { id: attemptId },
    data: { recordingKey: body.key },
  });

  return NextResponse.json({ success: true });
}
