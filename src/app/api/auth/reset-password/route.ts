import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyOtp } from "@/lib/otp";
import { hashPassword } from "@/lib/password";
import { resetPasswordSchema } from "@/lib/validation";
import { parseBody } from "@/lib/api";

export async function POST(request: Request) {
  const parsed = await parseBody(request, resetPasswordSchema);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const { email, code, newPassword } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "Invalid code" }, { status: 400 });
  }

  const result = await verifyOtp(user.id, "PASSWORD_RESET", code);
  if (!result.ok) {
    const messages = {
      invalid: "Invalid or already-used code",
      expired: "This code has expired, request a new one",
      too_many_attempts: "Too many attempts, request a new code",
    };
    return NextResponse.json(
      { error: messages[result.reason] },
      { status: 400 }
    );
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  return NextResponse.json({ success: true });
}
