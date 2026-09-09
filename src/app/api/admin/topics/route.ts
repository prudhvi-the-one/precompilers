import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { topicAuthorSchema } from "@/lib/validation";
import { uniqueSlug } from "@/lib/slugify";

export async function GET(request: Request) {
  const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const subjectId = searchParams.get("subjectId");
  if (!subjectId) {
    return NextResponse.json({ error: "subjectId is required" }, { status: 400 });
  }
  const topics = await prisma.topic.findMany({
    where: { subjectId },
    orderBy: { order: "asc" },
    include: { linkedQuiz: { select: { title: true } } },
  });
  return NextResponse.json({ topics });
}

export async function POST(request: Request) {
  const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = topicAuthorSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }
  const { submit, ...scalars } = parsed.data;

  const subject = await prisma.subject.findUnique({ where: { id: scalars.subjectId } });
  if (!subject) {
    return NextResponse.json({ error: "Subject not found" }, { status: 404 });
  }

  const duplicateOrder = await prisma.topic.findUnique({
    where: { subjectId_order: { subjectId: scalars.subjectId, order: scalars.order } },
  });
  if (duplicateOrder) {
    return NextResponse.json(
      { error: "A topic with that position already exists in this subject" },
      { status: 400 }
    );
  }

  const slug = await uniqueSlug(scalars.name, async (candidate) =>
    Boolean(await prisma.topic.findUnique({ where: { slug: candidate } }))
  );

  const topic = await prisma.topic.create({
    data: {
      ...scalars,
      unitLabel: scalars.unitLabel || null,
      linkedQuizId: scalars.linkedQuizId || null,
      simulatorKey: scalars.simulatorKey || null,
      slug,
      status: submit ? "PUBLISHED" : "DRAFT",
    },
  });

  return NextResponse.json({ topic }, { status: 201 });
}
