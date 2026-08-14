import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { quizAuthorSchema } from "@/lib/validation";
import { uniqueSlug } from "@/lib/slugify";

export async function POST(request: Request) {
  const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
  void submit;
  const slug = await uniqueSlug(scalars.title, async (candidate) => {
    const existing = await prisma.quiz.findUnique({ where: { slug: candidate } });
    return existing !== null;
  });

  const quiz = await prisma.quiz.create({
    data: {
      ...scalars,
      slug,
      status: "PUBLISHED",
      authorId: admin.id,
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

  return NextResponse.json({ quiz }, { status: 201 });
}
