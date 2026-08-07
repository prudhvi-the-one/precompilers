import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { parseBody } from "@/lib/api";
import { z } from "zod";

const enrollSchema = z.object({ trackId: z.string().min(1) });

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = await parseBody(request, enrollSchema);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const track = await prisma.track.findUnique({
    where: { id: parsed.data.trackId },
    include: { batches: { orderBy: { startsAt: "asc" }, take: 1 } },
  });
  if (!track) {
    return NextResponse.json({ error: "Track not found" }, { status: 404 });
  }

  await prisma.enrollment.upsert({
    where: { userId: session.userId },
    create: {
      userId: session.userId,
      trackId: track.id,
      batchId: track.batches[0]?.id ?? null,
    },
    update: {
      trackId: track.id,
      batchId: track.batches[0]?.id ?? null,
    },
  });

  return NextResponse.json({ success: true });
}
