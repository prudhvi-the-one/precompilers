import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyOtp } from "@/lib/otp";
import { createSessionToken, setSessionCookie } from "@/lib/session";
import { verifyEmailSchema } from "@/lib/validation";
import { parseBody } from "@/lib/api";

export async function POST(request: Request) {
  const parsed = await parseBody(request, verifyEmailSchema);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const { email, code } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json(
      { error: "Invalid email or code" },
      { status: 400 }
    );
  }

  if (!user.emailVerifiedAt) {
    const result = await verifyOtp(user.id, "EMAIL_VERIFY", code);
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

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerifiedAt: new Date() },
    });
  }

  const token = await createSessionToken({ userId: user.id, role: user.role });
  await setSessionCookie(token);

  return NextResponse.json({ success: true });
}
