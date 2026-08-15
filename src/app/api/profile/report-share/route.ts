import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { reportShareSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = reportShareSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }

  const { enabled, showCollege, showMockNotes } = parsed.data;
  const prefUpdate = {
    ...(showCollege !== undefined ? { reportShowCollege: showCollege } : {}),
    ...(showMockNotes !== undefined ? { reportShowMockNotes: showMockNotes } : {}),
  };

  if (!enabled) {
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { reportShareToken: null, ...prefUpdate },
    });
    return NextResponse.json({
      token: null,
      showCollege: updated.reportShowCollege,
      showMockNotes: updated.reportShowMockNotes,
    });
  }

  if (user.reportShareToken) {
    const updated = Object.keys(prefUpdate).length
      ? await prisma.user.update({ where: { id: user.id }, data: prefUpdate })
      : user;
    return NextResponse.json({
      token: updated.reportShareToken,
      showCollege: updated.reportShowCollege,
      showMockNotes: updated.reportShowMockNotes,
    });
  }

  const token = crypto.randomBytes(20).toString("hex");
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { reportShareToken: token, ...prefUpdate },
  });

  return NextResponse.json({
    token: updated.reportShareToken,
    showCollege: updated.reportShowCollege,
    showMockNotes: updated.reportShowMockNotes,
  });
}
