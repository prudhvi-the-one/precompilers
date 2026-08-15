import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyOtp } from "@/lib/otp";
import { createSessionToken, setSessionCookie } from "@/lib/session";
import { phoneLoginVerifySchema } from "@/lib/validation";
import { parseBody } from "@/lib/api";
import { isPhoneLoginEnabled } from "@/lib/featureFlags";

export async function POST(request: Request) {
  if (!isPhoneLoginEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const parsed = await parseBody(request, phoneLoginVerifySchema);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const { phoneNumber, code } = parsed.data;

  const user = await prisma.user.findUnique({ where: { phoneNumber } });
  if (!user) {
    return NextResponse.json({ error: "Invalid phone number or code" }, { status: 400 });
  }

  const result = await verifyOtp(user.id, "PHONE_LOGIN", code);
  if (!result.ok) {
    const messages = {
      invalid: "Invalid or already-used code",
      expired: "This code has expired, request a new one",
      too_many_attempts: "Too many attempts, request a new code",
    };
    return NextResponse.json({ error: messages[result.reason] }, { status: 400 });
  }

  const token = await createSessionToken({ userId: user.id, role: user.role });
  await setSessionCookie(token);

  return NextResponse.json({ success: true, role: user.role });
}
