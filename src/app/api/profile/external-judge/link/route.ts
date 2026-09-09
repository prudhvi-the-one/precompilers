import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { externalJudgeLinkSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!user.vendorId) {
    return NextResponse.json(
      { error: "External judge tracking is only available for vendor-provisioned students" },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = externalJudgeLinkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }

  const verificationCode = `precompilers-verify-${crypto.randomBytes(4).toString("hex")}`;

  const account = await prisma.externalJudgeAccount.upsert({
    where: { userId_platform: { userId: user.id, platform: parsed.data.platform } },
    update: {
      handle: parsed.data.handle,
      verificationCode,
      verifiedAt: null,
      trackingStatus: "UNVERIFIED",
    },
    create: {
      userId: user.id,
      platform: parsed.data.platform,
      handle: parsed.data.handle,
      verificationCode,
      trackingStatus: "UNVERIFIED",
    },
  });

  return NextResponse.json({ account });
}
