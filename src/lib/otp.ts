import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import type { OtpPurpose } from "@prisma/client";

const CODE_LENGTH = 6;
const EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 60;

function generateCode(): string {
  const max = 10 ** CODE_LENGTH;
  return crypto.randomInt(0, max).toString().padStart(CODE_LENGTH, "0");
}

function hashCode(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}

export type CreateOtpResult =
  | { ok: true; code: string }
  | { ok: false; reason: "cooldown"; retryAfterSeconds: number };

export async function createOtp(
  userId: string,
  purpose: OtpPurpose
): Promise<CreateOtpResult> {
  const latest = await prisma.otp.findFirst({
    where: { userId, purpose },
    orderBy: { createdAt: "desc" },
  });

  if (latest) {
    const secondsSinceLastSend =
      (Date.now() - latest.createdAt.getTime()) / 1000;
    if (secondsSinceLastSend < RESEND_COOLDOWN_SECONDS) {
      return {
        ok: false,
        reason: "cooldown",
        retryAfterSeconds: Math.ceil(
          RESEND_COOLDOWN_SECONDS - secondsSinceLastSend
        ),
      };
    }
  }

  const code = generateCode();
  await prisma.otp.create({
    data: {
      userId,
      purpose,
      codeHash: hashCode(code),
      expiresAt: new Date(Date.now() + EXPIRY_MINUTES * 60 * 1000),
    },
  });

  return { ok: true, code };
}

export type VerifyOtpResult =
  | { ok: true }
  | { ok: false; reason: "invalid" | "expired" | "too_many_attempts" };

export async function verifyOtp(
  userId: string,
  purpose: OtpPurpose,
  code: string
): Promise<VerifyOtpResult> {
  const otp = await prisma.otp.findFirst({
    where: { userId, purpose, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) {
    return { ok: false, reason: "invalid" };
  }

  if (otp.expiresAt < new Date()) {
    return { ok: false, reason: "expired" };
  }

  if (otp.attempts >= MAX_ATTEMPTS) {
    return { ok: false, reason: "too_many_attempts" };
  }

  if (otp.codeHash !== hashCode(code)) {
    await prisma.otp.update({
      where: { id: otp.id },
      data: { attempts: { increment: 1 } },
    });
    return { ok: false, reason: "invalid" };
  }

  await prisma.otp.update({
    where: { id: otp.id },
    data: { consumedAt: new Date() },
  });

  return { ok: true };
}
