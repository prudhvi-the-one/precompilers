import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { subjectAuthorSchema } from "@/lib/validation";
import { uniqueSlug } from "@/lib/slugify";

export async function GET() {
  const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const subjects = await prisma.subject.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { topics: true } } },
  });
  return NextResponse.json({ subjects });
}

export async function POST(request: Request) {
  const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = subjectAuthorSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }
  const { submit, ...scalars } = parsed.data;

  const slug = await uniqueSlug(scalars.name, async (candidate) =>
    Boolean(await prisma.subject.findUnique({ where: { slug: candidate } }))
  );

  const subject = await prisma.subject.create({
    data: { ...scalars, slug, status: submit ? "PUBLISHED" : "DRAFT" },
  });

  return NextResponse.json({ subject }, { status: 201 });
}
