import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { companyQuestionSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const mentor = await requireRole("MENTOR");
  if (!mentor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  const companyQuestion = await prisma.companyQuestion.create({
    data: {
      ...scalars,
      status: submit ? "PENDING_REVIEW" : "DRAFT",
      authorId: mentor.id,
      submittedAt: submit ? new Date() : null,
    },
  });

  return NextResponse.json({ companyQuestion }, { status: 201 });
}
