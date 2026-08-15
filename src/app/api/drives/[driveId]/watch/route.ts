import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ driveId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { driveId } = await params;

  const drive = await prisma.drive.findUnique({ where: { id: driveId } });
  if (!drive) {
    return NextResponse.json({ error: "Drive not found" }, { status: 404 });
  }

  await prisma.driveEligibilityWatch.upsert({
    where: { userId_driveId: { userId: user.id, driveId } },
    create: { userId: user.id, driveId },
    update: {},
  });

  return NextResponse.json({ watching: true });
}
