import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { applicationSchema } from "@/lib/validation";
import { parseBody } from "@/lib/api";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = await parseBody(request, applicationSchema);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const { driveId, appliedAt, deadline, notes, status } = parsed.data;
  let { companyName, roleTitle } = parsed.data;

  let resolvedDeadline: Date | null = deadline ? new Date(deadline) : null;

  if (driveId) {
    const drive = await prisma.drive.findUnique({ where: { id: driveId } });
    if (!drive) {
      return NextResponse.json({ error: "Drive not found" }, { status: 404 });
    }
    const existing = await prisma.application.findUnique({
      where: { userId_driveId: { userId: user.id, driveId } },
    });
    if (existing) {
      return NextResponse.json(
        { error: "You've already logged an application for this drive" },
        { status: 409 }
      );
    }
    companyName = drive.companyName;
    roleTitle = drive.roleTitle;
    resolvedDeadline = drive.applyDeadline;
  }

  const application = await prisma.application.create({
    data: {
      userId: user.id,
      driveId: driveId ?? null,
      companyName,
      roleTitle,
      status,
      appliedAt: appliedAt ? new Date(appliedAt) : new Date(),
      deadline: resolvedDeadline,
      notes: notes ?? null,
    },
  });

  return NextResponse.json({ application }, { status: 201 });
}
