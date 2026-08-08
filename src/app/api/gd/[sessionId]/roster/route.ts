import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessionId } = await params;
  const participants = await prisma.gdParticipant.findMany({
    where: { sessionId },
    orderBy: { joinedAt: "asc" },
    include: { user: true },
  });

  return NextResponse.json({
    participants: participants.map((p) => ({
      userId: p.userId,
      displayName: p.user.name ?? "Student",
    })),
  });
}
