import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { mockFeedbackSchema } from "@/lib/validation";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { requestId } = await params;
  const body = await request.json().catch(() => null);
  const parsed = mockFeedbackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid feedback" },
      { status: 400 }
    );
  }

  const mockRequest = await prisma.mockRequest.findUnique({
    where: { id: requestId },
    include: { pairedWith: true },
  });
  if (!mockRequest || mockRequest.userId !== session.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!mockRequest.pairedWith) {
    return NextResponse.json({ error: "Not paired yet" }, { status: 409 });
  }

  try {
    await prisma.mockFeedback.create({
      data: {
        mockRequestId: requestId,
        raterId: session.userId,
        rateeId: mockRequest.pairedWith.userId,
        ...parsed.data,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "You've already given feedback for this mock" },
      { status: 409 }
    );
  }

  return NextResponse.json({ success: true });
}
