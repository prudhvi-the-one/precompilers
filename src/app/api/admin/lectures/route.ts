import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { lectureSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = lectureSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }

  const track = await prisma.track.findUnique({ where: { id: parsed.data.trackId } });
  if (!track) {
    return NextResponse.json({ error: "Track not found" }, { status: 404 });
  }

  const order = (await prisma.lecture.count({ where: { trackId: track.id } })) + 1;
  const lecture = await prisma.lecture.create({
    data: { ...parsed.data, order },
  });

  return NextResponse.json({ lecture }, { status: 201 });
}
