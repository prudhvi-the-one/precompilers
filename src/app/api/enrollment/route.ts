import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { onboardingSchema } from "@/lib/validation";
import { parseBody } from "@/lib/api";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = await parseBody(request, onboardingSchema);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const { targetRole, gradYear, weeklyHours } = parsed.data;

  await prisma.user.update({
    where: { id: session.userId },
    data: { targetRole, gradYear: gradYear ?? null, weeklyHours: weeklyHours ?? null },
  });

  const recommendedTrack = await prisma.track.findFirst({
    where: { relevantRoles: { has: targetRole } },
    orderBy: { order: "asc" },
    include: { batches: { orderBy: { startsAt: "asc" }, take: 1 } },
  });

  let enrolledTrackSlug: string | null = null;

  if (recommendedTrack) {
    await prisma.enrollment.upsert({
      where: { userId: session.userId },
      create: {
        userId: session.userId,
        trackId: recommendedTrack.id,
        batchId: recommendedTrack.batches[0]?.id ?? null,
      },
      update: {
        trackId: recommendedTrack.id,
        batchId: recommendedTrack.batches[0]?.id ?? null,
      },
    });
    enrolledTrackSlug = recommendedTrack.slug;
  }

  return NextResponse.json({ success: true, enrolledTrackSlug });
}
