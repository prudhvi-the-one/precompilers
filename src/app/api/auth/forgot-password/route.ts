import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createOtp } from "@/lib/otp";
import { sendPasswordResetEmail } from "@/lib/email";
import { forgotPasswordSchema } from "@/lib/validation";
import { parseBody } from "@/lib/api";

const GENERIC_MESSAGE = {
  success: true,
  message: "If an account exists for that email, a reset code has been sent.",
};

export async function POST(request: Request) {
  const parsed = await parseBody(request, forgotPasswordSchema);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const { email } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const otpResult = await createOtp(user.id, "PASSWORD_RESET");
    if (otpResult.ok) {
      await sendPasswordResetEmail(email, otpResult.code);
    }
    // On cooldown, stay silent — a code was already sent recently.
  }

  return NextResponse.json(GENERIC_MESSAGE);
}
