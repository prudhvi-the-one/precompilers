import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { mentorSessionBookSchema } from "@/lib/validation";
import { createDailyRoom } from "@/lib/daily";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.role !== "STUDENT") {
    return NextResponse.json({ error: "Only students can book a mentor session" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = mentorSessionBookSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }

  let mentorSession: { id: string };
  try {
    mentorSession = await prisma.$transaction(async (tx) => {
      const slot = await tx.mentorAvailability.findUnique({
        where: { id: parsed.data.slotId },
      });
      if (!slot || slot.isBooked) {
        throw new Error("SLOT_UNAVAILABLE");
      }

      await tx.mentorAvailability.update({
        where: { id: slot.id },
        data: { isBooked: true },
      });

      return tx.mentorSession.create({
        data: {
          kind: parsed.data.kind,
          mentorId: slot.mentorId,
          studentId: session.userId,
          slotId: slot.id,
        },
      });
    });
  } catch {
    return NextResponse.json(
      { error: "That slot was just booked by someone else. Pick another." },
      { status: 409 }
    );
  }

  try {
    const { url: roomUrl } = await createDailyRoom(
      `precompilers-mentor-${mentorSession.id}`
    );
    await prisma.mentorSession.update({
      where: { id: mentorSession.id },
      data: { roomUrl },
    });
  } catch {
    return NextResponse.json(
      { error: "Video room temporarily unavailable. Try again in a moment." },
      { status: 503 }
    );
  }

  return NextResponse.json({ sessionId: mentorSession.id });
}
