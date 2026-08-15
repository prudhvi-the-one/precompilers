import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { hasTierAccess } from "@/lib/tier";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!(await hasTierAccess(user, "PROVE"))) {
    return NextResponse.json({ error: "Upgrade required" }, { status: 403 });
  }

  const { sessionId } = await params;
  const gdSession = await prisma.gdSession.findUnique({ where: { id: sessionId } });
  if (!gdSession) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.gdParticipant.upsert({
    where: { sessionId_userId: { sessionId, userId: session.userId } },
    update: {},
    create: { sessionId, userId: session.userId },
  });

  return NextResponse.json({ success: true });
}
