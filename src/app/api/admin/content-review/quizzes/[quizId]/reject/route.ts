import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { rejectContentSchema } from "@/lib/validation";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ quizId: string }> }
) {
  const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { quizId } = await params;
  const body = await request.json().catch(() => null);
  const parsed = rejectContentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }

  const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
  if (!quiz) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (quiz.status !== "PENDING_REVIEW") {
    return NextResponse.json({ error: "This item is not awaiting review" }, { status: 409 });
  }

  const updated = await prisma.quiz.update({
    where: { id: quizId },
    data: {
      status: "REJECTED",
      reviewedById: admin.id,
      reviewedAt: new Date(),
      rejectionReason: parsed.data.reason,
    },
  });

  return NextResponse.json({ quiz: updated });
}
