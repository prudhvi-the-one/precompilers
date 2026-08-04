import { z } from "zod";
import { isPasswordValid, PASSWORD_SPECIAL_CHARS } from "./passwordPolicy";

const email = z.string().trim().toLowerCase().email();
const password = z
  .string()
  .max(72, "Password must be at most 72 characters")
  .refine(isPasswordValid, {
    message: `Password must be at least 8 characters and include a letter, a number, and a special character (${PASSWORD_SPECIAL_CHARS})`,
  });
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
