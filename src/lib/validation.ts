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

export const profileUpdateSchema = z.object({
  name: z.string().trim().max(100).optional(),
  college: z.string().trim().max(150).optional(),
  branch: z.string().trim().max(100).optional(),
  gradYear: z.number().int().min(2000).max(2100).nullable().optional(),
});

export const onboardingSchema = z.object({
  targetRole: z.enum([
    "SOFTWARE_ENGINEER",
    "DATA_ML_ENGINEER",
    "FRONTEND_ENGINEER",
    "CLOUD_DEVOPS",
    "HIGHER_STUDIES",
    "NOT_SURE",
  ]),
  gradYear: z.number().int().min(2000).max(2100).nullable().optional(),
  weeklyHours: z.string().max(20).nullable().optional(),
});

export const projectSubmissionSchema = z.object({
  submissionUrl: z.string().trim().url("Enter a valid URL"),
  description: z
    .string()
    .trim()
    .min(20, "Say a bit more — at least 20 characters")
    .max(2000),
});

export const peerReviewSchema = z.object({
  correctness: z.number().int().min(1).max(5),
  efficiency: z.number().int().min(1).max(5),
  readability: z.number().int().min(1).max(5),
  wouldHire: z.enum(["NOT_YET", "CLOSE", "YES"]),
  comment: z
    .string()
    .trim()
    .min(40, "One thing to change needs at least 40 characters")
    .max(1000),
});

export const mockFeedbackSchema = z.object({
  score: z.number().int().min(1).max(5),
  quote: z.string().trim().min(1).max(200),
});

export const gdRatingSchema = z.object({
  rateeId: z.string().min(1),
  clarity: z.number().int().min(1).max(5),
  content: z.number().int().min(1).max(5),
  courtesy: z.number().int().min(1).max(5),
});

export const runSubmitSchema = z.object({
  language: z.enum(["PYTHON3", "JAVASCRIPT", "JAVA", "CPP", "C"]),
  sourceCode: z.string().min(1, "Write some code first").max(20000),
});

export const problemCommentSchema = z.object({
  body: z.string().trim().min(1, "Comment can't be empty").max(2000),
});

export const mentorAvailabilitySchema = z.object({
  startsAt: z.string().datetime(),
  durationMinutes: z.number().int().min(15).max(120).default(30),
});

export const mentorSessionBookSchema = z.object({
  slotId: z.string().min(1),
  kind: z.enum(["MOCK", "HR_ROUND", "COUNSELLING"]),
});

export const mentorScorecardSchema = z.object({
  technical: z.number().int().min(1).max(5),
  communication: z.number().int().min(1).max(5),
  problemSolving: z.number().int().min(1).max(5),
  confidence: z.number().int().min(1).max(5),
  verdict: z.enum(["NOT_YET", "CLOSE", "YES"]),
  writtenFeedback: z.string().trim().min(20, "Say a bit more — at least 20 characters").max(2000),
});

export const mentorSessionNotesSchema = z.object({
  notes: z.string().trim().min(1, "Notes can't be empty").max(2000),
});
