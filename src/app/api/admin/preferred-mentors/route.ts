import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { preferredMentorSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const actor = await requireRole("INSTITUTION_ADMIN");
  if (!actor || !actor.institutionId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = preferredMentorSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }

  const mentor = await prisma.mentorProfile.findUnique({
    where: { id: parsed.data.mentorId },
  });
  if (!mentor) {
    return NextResponse.json({ error: "Mentor not found" }, { status: 404 });
  }

  const institutionId = actor.institutionId;
  const mentorId = mentor.id;

  if (parsed.data.preferred) {
    await prisma.institutionPreferredMentor.upsert({
      where: { institutionId_mentorId: { institutionId, mentorId } },
      update: {},
      create: { institutionId, mentorId },
    });
  } else {
    await prisma.institutionPreferredMentor.deleteMany({
      where: { institutionId, mentorId },
    });
  }

  return NextResponse.json({ success: true });
}
