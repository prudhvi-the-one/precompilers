import crypto from "crypto";
import type { Role, User } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { createOtp } from "@/lib/otp";
import { sendPasswordResetEmail } from "@/lib/email";

const ALLOWED_TARGETS: Record<Role, Role[]> = {
  SUPER_ADMIN: ["ADMIN", "INSTITUTION_ADMIN", "MENTOR", "STUDENT"],
  ADMIN: ["INSTITUTION_ADMIN", "MENTOR", "STUDENT"],
  INSTITUTION_ADMIN: ["FACULTY", "STUDENT"],
  FACULTY: [],
  MENTOR: [],
  STUDENT: [],
};

export type ProvisionInput = {
  email: string;
  name: string;
  role: Role;
  institutionId?: string;
  facultyBatchId?: string;
};

export type ProvisionResult =
  | { ok: true; userId: string }
  | { ok: false; error: string };

export async function provisionUser(
  actor: User,
  input: ProvisionInput
): Promise<ProvisionResult> {
  const allowed = ALLOWED_TARGETS[actor.role] ?? [];
  if (!allowed.includes(input.role)) {
    return { ok: false, error: "You can't create an account with that role" };
  }

  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    return { ok: false, error: "An account with that email already exists" };
  }

  if (input.role === "FACULTY" && !input.facultyBatchId) {
    return { ok: false, error: "Faculty must be assigned to a batch" };
  }

  // Institution admins can only provision within their own institution —
  // never trust a client-supplied institutionId for this actor role.
  const institutionId =
    actor.role === "INSTITUTION_ADMIN" ? (actor.institutionId ?? undefined) : input.institutionId;

  const randomPassword = crypto.randomBytes(32).toString("hex");
  const passwordHash = await hashPassword(randomPassword);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
      role: input.role,
      passwordHash,
      emailVerifiedAt: new Date(),
      institutionId: institutionId ?? null,
      facultyBatchId: input.role === "FACULTY" ? input.facultyBatchId : null,
      entitlement: input.role === "STUDENT" && institutionId ? "INSTITUTION" : undefined,
    },
  });

  const otpResult = await createOtp(user.id, "PASSWORD_RESET");
  if (otpResult.ok) {
    await sendPasswordResetEmail(user.email, otpResult.code);
  }

  return { ok: true, userId: user.id };
}
