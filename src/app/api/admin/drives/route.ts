import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { driveSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const actor = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = driveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }

  const drive = await prisma.drive.create({
    data: {
      companyName: parsed.data.companyName,
      roleTitle: parsed.data.roleTitle,
      driveDate: new Date(parsed.data.driveDate),
      applyDeadline: parsed.data.applyDeadline ? new Date(parsed.data.applyDeadline) : null,
      applyUrl: parsed.data.applyUrl ?? null,
      location: parsed.data.location ?? null,
      description: parsed.data.description,
    },
  });

  return NextResponse.json({ drive }, { status: 201 });
}
