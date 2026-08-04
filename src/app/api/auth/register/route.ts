import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { createOtp } from "@/lib/otp";
import { sendVerificationEmail } from "@/lib/email";
import { registerSchema } from "@/lib/validation";
import { parseBody } from "@/lib/api";

export async function POST(request: Request) {
  const parsed = await parseBody(request, registerSchema);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const { email, password, name, college, branch, gradYear } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing?.emailVerifiedAt) {
    return NextResponse.json(
      { error: "An account with this email already exists. Try logging in." },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);

  const user = existing
    ? await prisma.user.update({
        where: { id: existing.id },
        data: { passwordHash, name, college, branch, gradYear },
      })
    : await prisma.user.create({
        data: { email, passwordHash, name, college, branch, gradYear },
      });

  const otpResult = await createOtp(user.id, "EMAIL_VERIFY");
  if (!otpResult.ok) {
    return NextResponse.json(
      {
        error: "Please wait before requesting another code",
        retryAfterSeconds: otpResult.retryAfterSeconds,
      },
      { status: 429 }
    );
  }

  await sendVerificationEmail(email, otpResult.code);

  return NextResponse.json({ success: true });
}
