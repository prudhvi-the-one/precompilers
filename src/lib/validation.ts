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
const phoneNumber = z
  .string()
  .trim()
  .regex(/^\+?[1-9]\d{7,14}$/, "Enter a valid phone number with country code");

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

export const phoneLoginRequestSchema = z.object({
  phoneNumber,
});

export const phoneLoginVerifySchema = z.object({
  phoneNumber,
  code: otpCode,
});

export const profileUpdateSchema = z.object({
  name: z.string().trim().max(100).optional(),
  college: z.string().trim().max(150).optional(),
  branch: z.string().trim().max(100).optional(),
  gradYear: z.number().int().min(2000).max(2100).nullable().optional(),
  phoneNumber: phoneNumber.nullable().optional(),
  whatsappOptIn: z.boolean().optional(),
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

export const trackSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(150),
  tagline: z.string().trim().min(1, "Tagline is required").max(300),
  requiredEntitlement: z.enum(["FREE", "INDIVIDUAL", "INSTITUTION"]).default("FREE"),
  relevantRoles: z
    .array(
      z.enum([
        "SOFTWARE_ENGINEER",
        "DATA_ML_ENGINEER",
        "FRONTEND_ENGINEER",
        "CLOUD_DEVOPS",
        "HIGHER_STUDIES",
        "NOT_SURE",
      ])
    )
    .default([]),
});

export const lectureSchema = z.object({
  trackId: z.string().min(1),
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().max(2000).default(""),
  videoUrl: z.string().trim().url("Enter a valid video URL"),
  durationMinutes: z.number().int().min(1).max(600),
});

export const noteSchema = z.object({
  trackId: z.string().min(1),
  title: z.string().trim().min(1, "Title is required").max(200),
  content: z.string().trim().min(1, "Content can't be empty").max(20000),
});

export const liveClassSchema = z.object({
  batchId: z.string().min(1).optional(),
  title: z.string().trim().min(1, "Title is required").max(200),
  scheduledAt: z.string().datetime(),
  durationMinutes: z.number().int().min(15).max(240),
});

export const preferredMentorSchema = z.object({
  mentorId: z.string().min(1),
  preferred: z.boolean(),
});

export const reportShareSchema = z.object({
  enabled: z.boolean(),
});

const resumeEducationSchema = z.object({
  institution: z.string().trim().min(1, "Institution is required").max(150),
  degree: z.string().trim().min(1, "Degree is required").max(150),
  fieldOfStudy: z.string().trim().max(150).nullable().optional(),
  startYear: z.number().int().min(1980).max(2100).nullable().optional(),
  endYear: z.number().int().min(1980).max(2100).nullable().optional(),
  gpa: z.string().trim().max(20).nullable().optional(),
});

const resumeExperienceSchema = z.object({
  company: z.string().trim().min(1, "Company is required").max(150),
  role: z.string().trim().min(1, "Role is required").max(150),
  startDate: z.string().trim().min(1, "Start date is required").max(50),
  endDate: z.string().trim().max(50).nullable().optional(),
  description: z.string().trim().max(2000).default(""),
});

const resumeProjectSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(150),
  techStack: z.string().trim().max(200).nullable().optional(),
  link: z.string().trim().url("Enter a valid URL").nullable().optional(),
  description: z.string().trim().max(2000).default(""),
});

export const resumeSchema = z.object({
  fullName: z.string().trim().min(1, "Name is required").max(150),
  email: z.string().trim().email("Enter a valid email"),
  phone: z.string().trim().max(30).nullable().optional(),
  location: z.string().trim().max(150).nullable().optional(),
  linkedinUrl: z.string().trim().url("Enter a valid URL").nullable().optional(),
  githubUrl: z.string().trim().url("Enter a valid URL").nullable().optional(),
  portfolioUrl: z.string().trim().url("Enter a valid URL").nullable().optional(),
  summary: z.string().trim().max(1000).nullable().optional(),
  skills: z.array(z.string().trim().min(1).max(40)).max(40).default([]),
  education: z.array(resumeEducationSchema).max(10).default([]),
  experience: z.array(resumeExperienceSchema).max(15).default([]),
  projects: z.array(resumeProjectSchema).max(15).default([]),
});

export const companyQuestionSchema = z
  .object({
    companyName: z.string().trim().max(150),
    category: z.enum(["BEHAVIORAL", "TECHNICAL", "HR"]),
    question: z.string().trim().max(2000),
    guidance: z.string().trim().max(3000),
    submit: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (!data.submit) {
      return;
    }
    if (!data.companyName.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["companyName"],
        message: "Company name is required before submitting for review",
      });
    }
    if (!data.question.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["question"],
        message: "Question is required before submitting for review",
      });
    }
    if (!data.guidance.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["guidance"],
        message: "Guidance is required before submitting for review",
      });
    }
  });

export const driveSchema = z.object({
  companyName: z.string().trim().min(1, "Company name is required").max(150),
  roleTitle: z.string().trim().min(1, "Role is required").max(150),
  driveDate: z.string().datetime(),
  applyDeadline: z.string().datetime().optional(),
  applyUrl: z.string().trim().url("Enter a valid URL").optional(),
  location: z.string().trim().max(150).optional(),
  description: z.string().trim().max(3000).default(""),
});

export const applicationSchema = z
  .object({
    driveId: z.string().trim().min(1).optional(),
    companyName: z.string().trim().max(150),
    roleTitle: z.string().trim().max(150),
    status: z.enum(["APPLIED", "INTERVIEWING", "OFFER", "REJECTED", "WITHDRAWN"]).default("APPLIED"),
    appliedAt: z.string().datetime().optional(),
    deadline: z.string().datetime().nullable().optional(),
    notes: z.string().trim().max(2000).nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.driveId) return;
    if (!data.companyName.trim()) {
      ctx.addIssue({ code: "custom", path: ["companyName"], message: "Company name is required" });
    }
    if (!data.roleTitle.trim()) {
      ctx.addIssue({ code: "custom", path: ["roleTitle"], message: "Role is required" });
    }
  });

export const applicationStatusSchema = z.object({
  status: z.enum(["APPLIED", "INTERVIEWING", "OFFER", "REJECTED", "WITHDRAWN"]),
  notes: z.string().trim().max(2000).nullable().optional(),
  deadline: z.string().datetime().nullable().optional(),
});

export const rejectContentSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(10, "Give the mentor at least a short reason (10+ characters)")
    .max(1000),
});

const quizOptionSchema = z.object({
  label: z.string().trim().max(5),
  text: z.string().trim().max(500),
  isCorrect: z.boolean(),
});

const quizQuestionSchema = z.object({
  text: z.string().trim().max(2000),
  marks: z.number().int().min(1).max(20),
  order: z.number().int().min(0),
  options: z.array(quizOptionSchema).max(4),
});

const quizSectionSchema = z.object({
  name: z.string().trim().max(150),
  durationMinutes: z.number().int().min(1).max(180),
  order: z.number().int().min(0),
  questions: z.array(quizQuestionSchema).max(50),
});

export const quizAuthorSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(200),
    topic: z.string().trim().min(1, "Topic is required").max(100),
    kind: z.enum(["TOPIC_QUIZ", "APTITUDE_PAPER"]),
    requiredEntitlement: z.enum(["FREE", "INDIVIDUAL", "INSTITUTION"]).default("FREE"),
    order: z.number().int().min(0).default(0),
    submit: z.boolean(),
    sections: z.array(quizSectionSchema).max(20),
  })
  .superRefine((data, ctx) => {
    if (!data.submit) {
      return;
    }
    if (data.sections.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["sections"],
        message: "Add at least one section before submitting for review",
      });
    }
    data.sections.forEach((section, sIndex) => {
      if (!section.name.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["sections", sIndex, "name"],
          message: "Section name is required",
        });
      }
      if (section.questions.length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["sections", sIndex, "questions"],
          message: "Add at least one question to each section",
        });
      }
      section.questions.forEach((question, qIndex) => {
        if (!question.text.trim()) {
          ctx.addIssue({
            code: "custom",
            path: ["sections", sIndex, "questions", qIndex, "text"],
            message: "Question text is required",
          });
        }
        if (question.options.length !== 4) {
          ctx.addIssue({
            code: "custom",
            path: ["sections", sIndex, "questions", qIndex, "options"],
            message: "Each question needs exactly 4 options",
          });
        } else {
          if (question.options.some((o) => !o.text.trim())) {
            ctx.addIssue({
              code: "custom",
              path: ["sections", sIndex, "questions", qIndex, "options"],
              message: "All 4 options must have text",
            });
          }
          if (question.options.filter((o) => o.isCorrect).length !== 1) {
            ctx.addIssue({
              code: "custom",
              path: ["sections", sIndex, "questions", qIndex, "options"],
              message: "Exactly one option must be marked correct",
            });
          }
        }
      });
    });
  });

const problemExampleSchema = z.object({
  input: z.string().trim().max(2000),
  output: z.string().trim().max(2000),
  explanation: z.string().trim().max(1000).default(""),
});

const problemTestCaseSchema = z.object({
  input: z.string().max(5000),
  expectedOutput: z.string().max(5000),
  isSample: z.boolean().default(false),
});

export const problemAuthorSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(200),
    difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
    category: z.string().trim().max(100),
    tags: z.array(z.string().trim().min(1).max(30)).max(20).default([]),
    companies: z.array(z.string().trim().min(1).max(50)).max(20).default([]),
    statement: z.string().trim().max(10000),
    examples: z.array(problemExampleSchema).max(10).default([]),
    constraints: z.string().trim().max(2000).default(""),
    hints: z.string().trim().max(2000).default(""),
    solutionExplanation: z.string().trim().max(5000).default(""),
    requiredEntitlement: z.enum(["FREE", "INDIVIDUAL", "INSTITUTION"]).default("FREE"),
    order: z.number().int().min(0).default(0),
    submit: z.boolean(),
    testCases: z.array(problemTestCaseSchema).max(50).default([]),
  })
  .superRefine((data, ctx) => {
    if (!data.submit) {
      return;
    }
    if (!data.statement.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["statement"],
        message: "Problem statement is required before submitting for review",
      });
    }
    if (!data.category.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["category"],
        message: "Category is required before submitting for review",
      });
    }
    if (data.testCases.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["testCases"],
        message: "Add at least one test case before submitting for review",
      });
    } else {
      if (!data.testCases.some((t) => t.isSample)) {
        ctx.addIssue({
          code: "custom",
          path: ["testCases"],
          message: "At least one test case must be marked as a visible sample",
        });
      }
      if (data.testCases.some((t) => !t.input.trim() || !t.expectedOutput.trim())) {
        ctx.addIssue({
          code: "custom",
          path: ["testCases"],
          message: "Every test case needs both input and expected output",
        });
      }
    }
  });
