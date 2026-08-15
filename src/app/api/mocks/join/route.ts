import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { createDailyRoom } from "@/lib/daily";
import { hasTierAccess } from "@/lib/tier";

export async function POST() {
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

  let claimed: { requestId: string; paired: boolean; waitingId: string | null };
  try {
    claimed = await prisma.$transaction(async (tx) => {
      const waiting = await tx.mockRequest.findFirst({
        where: { pairedWithId: null, userId: { not: session.userId } },
        orderBy: { createdAt: "asc" },
      });

      const mine = await tx.mockRequest.create({
        data: { userId: session.userId },
      });

      if (!waiting) {
        return { requestId: mine.id, paired: false, waitingId: null };
      }

      const scheduledAt = new Date();
      await tx.mockRequest.update({
        where: { id: mine.id },
        data: { pairedWithId: waiting.id, scheduledAt },
      });
      await tx.mockRequest.update({
        where: { id: waiting.id },
        data: { pairedWithId: mine.id, scheduledAt },
      });
      return { requestId: mine.id, paired: true, waitingId: waiting.id };
    });
  } catch {
    // Lost a race to another simultaneous join — fall back to waiting alone.
    const mine = await prisma.mockRequest.create({
      data: { userId: session.userId },
    });
    return NextResponse.json({ requestId: mine.id, paired: false });
  }

  if (claimed.paired) {
    try {
      const { url: roomUrl } = await createDailyRoom(
        `precompilers-mock-${claimed.requestId}`
      );
      await prisma.mockRequest.updateMany({
        where: { id: { in: [claimed.requestId, claimed.waitingId as string] } },
        data: { roomUrl },
      });
    } catch {
      return NextResponse.json(
        { error: "Video room temporarily unavailable. Try again in a moment." },
        { status: 503 }
      );
    }
  }

  return NextResponse.json({ requestId: claimed.requestId, paired: claimed.paired });
}
