import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { mentorSessionNotesSchema } from "@/lib/validation";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const mentor = await requireRole("MENTOR");
  if (!mentor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessionId } = await params;
  const body = await request.json().catch(() => null);
  const parsed = mentorSessionNotesSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid submission" },
      { status: 400 }
    );
  }

  const mentorSession = await prisma.mentorSession.findUnique({
    where: { id: sessionId },
    include: { mentor: true },
  });
  if (!mentorSession || mentorSession.mentor.userId !== mentor.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (mentorSession.kind !== "COUNSELLING") {
    return NextResponse.json(
      { error: "Only counselling sessions use notes" },
      { status: 400 }
    );
  }

  await prisma.mentorSession.update({
    where: { id: sessionId },
    data: { notes: parsed.data.notes, status: "COMPLETED" },
  });

  return NextResponse.json({ success: true });
}
