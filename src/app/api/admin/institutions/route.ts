import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export async function POST(request: Request) {
  const actor = await requireRole(["SUPER_ADMIN", "ADMIN"]);
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.name || !body?.seatCount) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const institution = await prisma.institution.create({
    data: {
      name: body.name,
      seatCount: body.seatCount,
      renewsAt: body.renewsAt ? new Date(body.renewsAt) : null,
    },
  });

  return NextResponse.json({ institution });
}
