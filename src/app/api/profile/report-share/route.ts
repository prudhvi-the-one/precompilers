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

  if (!parsed.data.enabled) {
    await prisma.user.update({
      where: { id: user.id },
      data: { reportShareToken: null },
    });
    return NextResponse.json({ token: null });
  }

  if (user.reportShareToken) {
    return NextResponse.json({ token: user.reportShareToken });
  }

  const token = crypto.randomBytes(20).toString("hex");
  await prisma.user.update({
    where: { id: user.id },
    data: { reportShareToken: token },
  });

  return NextResponse.json({ token });
}
