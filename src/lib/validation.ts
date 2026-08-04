import { z } from "zod";

const email = z.string().trim().toLowerCase().email();
const password = z.string().min(8, "Password must be at least 8 characters");
const otpCode = z.string().regex(/^\d{6}$/, "Code must be 6 digits");

export const registerSchema = z.object({
  email,
  password,
  name: z.string().trim().min(1).optional(),
  college: z.string().trim().min(1).optional(),
  branch: z.string().trim().min(1).optional(),
  gradYear: z.number().int().min(2000).max(2100).optional(),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required"),
});

export const verifyEmailSchema = z.object({
  email,
  code: otpCode,
});

export const resendOtpSchema = z.object({
  email,
  purpose: z.enum(["EMAIL_VERIFY", "PASSWORD_RESET"]),
});

export const forgotPasswordSchema = z.object({
  email,
});

export const resetPasswordSchema = z.object({
  email,
  code: otpCode,
  newPassword: password,
});
