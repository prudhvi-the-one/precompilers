import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { trackSchema } from "@/lib/validation";
import { uniqueSlug } from "@/lib/slugify";

export async function POST(request: Request) {
  const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = trackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }

  const slug = await uniqueSlug(parsed.data.name, async (candidate) => {
    const existing = await prisma.track.findUnique({ where: { slug: candidate } });
    return existing !== null;
  });
  const order = (await prisma.track.count()) + 1;

  const track = await prisma.track.create({
    data: { ...parsed.data, slug, order },
  });

  return NextResponse.json({ track }, { status: 201 });
}
