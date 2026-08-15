import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createOtp } from "@/lib/otp";
import { sendSmsOtp } from "@/lib/sms";
import { phoneLoginRequestSchema } from "@/lib/validation";
import { parseBody } from "@/lib/api";
import { isPhoneLoginEnabled } from "@/lib/featureFlags";

export async function POST(request: Request) {
  if (!isPhoneLoginEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const parsed = await parseBody(request, phoneLoginRequestSchema);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const { phoneNumber } = parsed.data;

  const user = await prisma.user.findUnique({ where: { phoneNumber } });

  // Generic response either way: don't reveal whether the phone number is registered.
  if (!user) {
    return NextResponse.json({ success: true });
  }

  const otpResult = await createOtp(user.id, "PHONE_LOGIN");
  if (!otpResult.ok) {
    return NextResponse.json(
      {
        error: "Please wait before requesting another code",
        retryAfterSeconds: otpResult.retryAfterSeconds,
      },
      { status: 429 }
    );
  }

  await sendSmsOtp(phoneNumber, otpResult.code);

  return NextResponse.json({ success: true });
}
