import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createOtp } from "@/lib/otp";
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/email";
import { resendOtpSchema } from "@/lib/validation";
import { parseBody } from "@/lib/api";

export async function POST(request: Request) {
  const parsed = await parseBody(request, resendOtpSchema);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const { email, purpose } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });

  // Generic response either way: don't reveal whether the account exists.
  if (!user || (purpose === "EMAIL_VERIFY" && user.emailVerifiedAt)) {
    return NextResponse.json({ success: true });
  }

  const otpResult = await createOtp(user.id, purpose);
  if (!otpResult.ok) {
    return NextResponse.json(
      {
        error: "Please wait before requesting another code",
        retryAfterSeconds: otpResult.retryAfterSeconds,
      },
      { status: 429 }
    );
  }

  if (purpose === "EMAIL_VERIFY") {
    await sendVerificationEmail(email, otpResult.code);
  } else {
    await sendPasswordResetEmail(email, otpResult.code);
  }

  return NextResponse.json({ success: true });
}
