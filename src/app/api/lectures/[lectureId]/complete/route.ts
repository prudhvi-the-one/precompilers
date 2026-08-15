import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { hasTierAccess } from "@/lib/tier";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ lectureId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!(await hasTierAccess(user, "LEARN"))) {
    return NextResponse.json({ error: "Upgrade required" }, { status: 403 });
  }

  const { lectureId } = await params;

  await prisma.lectureProgress.upsert({
    where: { userId_lectureId: { userId: session.userId, lectureId } },
    create: { userId: session.userId, lectureId, completedAt: new Date() },
    update: { completedAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
