import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { mentorAvailabilitySchema } from "@/lib/validation";

export async function POST(request: Request) {
  const mentor = await requireRole("MENTOR");
  if (!mentor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = mentorAvailabilitySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }

  const mentorProfile = await prisma.mentorProfile.findUnique({
    where: { userId: mentor.id },
  });
  if (!mentorProfile) {
    return NextResponse.json({ error: "No mentor profile set up" }, { status: 404 });
  }

  const startsAt = new Date(parsed.data.startsAt);
  const dayStart = new Date(startsAt);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const slotsThatDay = await prisma.mentorAvailability.count({
    where: { mentorId: mentorProfile.id, startsAt: { gte: dayStart, lt: dayEnd } },
  });
  if (slotsThatDay >= mentorProfile.capacityPerDay) {
    return NextResponse.json(
      { error: `You've already opened ${mentorProfile.capacityPerDay} slots for that day.` },
      { status: 409 }
    );
  }

  const slot = await prisma.mentorAvailability.create({
    data: {
      mentorId: mentorProfile.id,
      startsAt,
      durationMinutes: parsed.data.durationMinutes,
    },
  });

  return NextResponse.json({ slot });
}
