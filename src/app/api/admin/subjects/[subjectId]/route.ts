import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { subjectAuthorSchema } from "@/lib/validation";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ subjectId: string }> }
) {
  const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { subjectId } = await params;
  const body = await request.json().catch(() => null);
  const parsed = subjectAuthorSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }
  const { submit, ...scalars } = parsed.data;

  const existing = await prisma.subject.findUnique({ where: { id: subjectId } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const subject = await prisma.subject.update({
    where: { id: subjectId },
    data: { ...scalars, status: submit !== undefined ? (submit ? "PUBLISHED" : "DRAFT") : undefined },
  });

  return NextResponse.json({ subject });
}
