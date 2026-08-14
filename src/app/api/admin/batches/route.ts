import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export async function POST(request: Request) {
  const actor = await requireRole(["SUPER_ADMIN", "ADMIN"]);
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.name || !body?.trackId || !body?.startsAt) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const batch = await prisma.batch.create({
    data: {
      name: body.name,
      trackId: body.trackId,
      institutionId: body.institutionId ?? null,
      startsAt: new Date(body.startsAt),
    },
  });

  return NextResponse.json({ batch });
}
