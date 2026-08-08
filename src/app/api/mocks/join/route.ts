import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const waiting = await tx.mockRequest.findFirst({
        where: { pairedWithId: null, userId: { not: session.userId } },
        orderBy: { createdAt: "asc" },
      });

      if (waiting) {
        const mine = await tx.mockRequest.create({
          data: { userId: session.userId },
        });
        const roomUrl = `https://meet.jit.si/precompilers-mock-${mine.id}`;
        const scheduledAt = new Date();
        await tx.mockRequest.update({
          where: { id: mine.id },
          data: { pairedWithId: waiting.id, roomUrl, scheduledAt },
        });
        await tx.mockRequest.update({
          where: { id: waiting.id },
          data: { pairedWithId: mine.id, roomUrl, scheduledAt },
        });
        return { requestId: mine.id, paired: true };
      }

      const mine = await tx.mockRequest.create({
        data: { userId: session.userId },
      });
      return { requestId: mine.id, paired: false };
    });

    return NextResponse.json(result);
  } catch {
    // Lost a race to another simultaneous join — fall back to waiting alone.
    const mine = await prisma.mockRequest.create({
      data: { userId: session.userId },
    });
    return NextResponse.json({ requestId: mine.id, paired: false });
  }
}
