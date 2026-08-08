import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { peerReviewSchema } from "@/lib/validation";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ submissionId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { submissionId } = await params;
  const body = await request.json().catch(() => null);
  const parsed = peerReviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid review" },
      { status: 400 }
    );
  }

  const submission = await prisma.projectSubmission.findUnique({
    where: { id: submissionId },
    include: { user: true },
  });
  if (!submission) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (submission.userId === session.userId) {
    return NextResponse.json(
      { error: "You can't review your own submission" },
      { status: 403 }
    );
  }

  try {
    await prisma.peerReview.create({
      data: { submissionId, reviewerId: session.userId, ...parsed.data },
    });
  } catch {
    return NextResponse.json(
      { error: "You've already reviewed this submission" },
      { status: 409 }
    );
  }

  return NextResponse.json({
    success: true,
    authorName: submission.user.name ?? "A student",
  });
}
