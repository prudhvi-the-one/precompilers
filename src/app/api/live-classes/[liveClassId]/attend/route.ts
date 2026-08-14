import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ liveClassId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { liveClassId } = await params;
  const liveClass = await prisma.liveClass.findUnique({ where: { id: liveClassId } });
  if (!liveClass) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId: session.userId },
  });
  if (enrollment?.batchId !== liveClass.batchId) {
    return NextResponse.json({ error: "Not enrolled in this batch" }, { status: 403 });
  }

  await prisma.liveClassAttendance.upsert({
    where: { liveClassId_userId: { liveClassId, userId: session.userId } },
    update: {},
    create: { liveClassId, userId: session.userId },
  });

  return NextResponse.json({ success: true });
}
