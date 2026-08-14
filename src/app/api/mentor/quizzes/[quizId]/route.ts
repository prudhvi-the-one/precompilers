import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { quizAuthorSchema } from "@/lib/validation";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ quizId: string }> }
) {
  const mentor = await requireRole("MENTOR");
  if (!mentor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { quizId } = await params;
  const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
  if (!quiz || quiz.authorId !== mentor.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (quiz.status !== "DRAFT" && quiz.status !== "REJECTED") {
    return NextResponse.json(
      { error: "Cannot edit content that is under review or published" },
      { status: 409 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = quizAuthorSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }

  const { submit, sections, ...scalars } = parsed.data;

  const updated = await prisma.$transaction(async (tx) => {
    await tx.quizSection.deleteMany({ where: { quizId } });
    return tx.quiz.update({
      where: { id: quizId },
      data: {
        ...scalars,
        status: submit ? "PENDING_REVIEW" : "DRAFT",
        submittedAt: submit ? new Date() : null,
        rejectionReason: null,
        sections: {
          create: sections.map((section) => ({
            name: section.name,
            durationMinutes: section.durationMinutes,
            order: section.order,
            questions: {
              create: section.questions.map((question) => ({
                text: question.text,
                marks: question.marks,
                order: question.order,
                options: {
                  create: question.options.map((option) => ({
                    label: option.label,
                    text: option.text,
                    isCorrect: option.isCorrect,
                  })),
                },
              })),
            },
          })),
        },
      },
    });
  });

  return NextResponse.json({ quiz: updated });
}
