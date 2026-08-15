import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { gdRatingSchema } from "@/lib/validation";
import { hasTierAccess } from "@/lib/tier";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
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

  const { sessionId } = await params;
  const body = await request.json().catch(() => null);
  const parsed = gdRatingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid rating" },
      { status: 400 }
    );
  }
  if (parsed.data.rateeId === session.userId) {
    return NextResponse.json(
      { error: "Can't rate yourself" },
      { status: 400 }
    );
  }

  await prisma.gdRating.upsert({
    where: {
      sessionId_raterId_rateeId: {
        sessionId,
        raterId: session.userId,
        rateeId: parsed.data.rateeId,
      },
    },
    update: parsed.data,
    create: { sessionId, raterId: session.userId, ...parsed.data },
  });

  return NextResponse.json({ success: true });
}
