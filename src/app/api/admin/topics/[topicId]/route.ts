import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { topicAuthorSchema } from "@/lib/validation";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ topicId: string }> }
) {
  const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { topicId } = await params;
  const body = await request.json().catch(() => null);
  const parsed = topicAuthorSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }
  const { submit, unitLabel, linkedQuizId, simulatorKey, ...scalars } = parsed.data;

  const existing = await prisma.topic.findUnique({ where: { id: topicId } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const topic = await prisma.topic.update({
    where: { id: topicId },
    data: {
      ...scalars,
      unitLabel: unitLabel !== undefined ? unitLabel || null : undefined,
      linkedQuizId: linkedQuizId !== undefined ? linkedQuizId || null : undefined,
      simulatorKey: simulatorKey !== undefined ? simulatorKey || null : undefined,
      status: submit !== undefined ? (submit ? "PUBLISHED" : "DRAFT") : undefined,
    },
  });

  return NextResponse.json({ topic });
}
