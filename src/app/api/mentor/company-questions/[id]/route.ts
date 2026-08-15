import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { companyQuestionSchema } from "@/lib/validation";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const mentor = await requireRole("MENTOR");
  if (!mentor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const companyQuestion = await prisma.companyQuestion.findUnique({ where: { id } });
  if (!companyQuestion || companyQuestion.authorId !== mentor.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (companyQuestion.status !== "DRAFT" && companyQuestion.status !== "REJECTED") {
    return NextResponse.json(
      { error: "Cannot edit content that is under review or published" },
      { status: 409 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = companyQuestionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }

  const { submit, ...scalars } = parsed.data;

  const updated = await prisma.companyQuestion.update({
    where: { id },
    data: {
      ...scalars,
      status: submit ? "PENDING_REVIEW" : "DRAFT",
      submittedAt: submit ? new Date() : null,
      rejectionReason: null,
    },
  });

  return NextResponse.json({ companyQuestion: updated });
}
