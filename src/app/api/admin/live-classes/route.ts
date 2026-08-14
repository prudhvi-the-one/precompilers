import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { liveClassSchema } from "@/lib/validation";
import { createDailyRoom } from "@/lib/daily";

export async function POST(request: Request) {
  const actor = await requireRole(["ADMIN", "SUPER_ADMIN", "FACULTY"]);
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = liveClassSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }

  const batchId = actor.role === "FACULTY" ? actor.facultyBatchId : parsed.data.batchId;
  if (!batchId) {
    return NextResponse.json({ error: "A batch is required" }, { status: 400 });
  }

  const batch = await prisma.batch.findUnique({ where: { id: batchId } });
  if (!batch) {
    return NextResponse.json({ error: "Batch not found" }, { status: 404 });
  }

  let joinUrl: string;
  try {
    const room = await createDailyRoom(`precompilers-live-${batchId}-${Date.now()}`);
    joinUrl = room.url;
  } catch {
    return NextResponse.json(
      { error: "Video room temporarily unavailable. Try again in a moment." },
      { status: 503 }
    );
  }

  const liveClass = await prisma.liveClass.create({
    data: {
      batchId,
      title: parsed.data.title,
      scheduledAt: new Date(parsed.data.scheduledAt),
      durationMinutes: parsed.data.durationMinutes,
      joinUrl,
    },
  });

  return NextResponse.json({ liveClass }, { status: 201 });
}
