import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { problemAuthorSchema } from "@/lib/validation";
import { uniqueSlug } from "@/lib/slugify";
import { verifyReferenceSolution } from "@/lib/judge";

export async function POST(request: Request) {
  const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = problemAuthorSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }

  const { submit, testCases, examples, ...scalars } = parsed.data;
  void submit;

  if (!scalars.referenceSolutionLanguage || !scalars.referenceSolutionCode.trim()) {
    return NextResponse.json(
      { error: "A reference solution and language are required before publishing." },
      { status: 400 }
    );
  }

  const verification = await verifyReferenceSolution(
    scalars.referenceSolutionLanguage,
    scalars.referenceSolutionCode,
    testCases
  );
  if (!verification.passed) {
    return NextResponse.json(
      {
        error:
          "Your reference solution didn't pass all test cases — fix the solution or the test cases before publishing.",
        verification,
      },
      { status: 422 }
    );
  }

  const slug = await uniqueSlug(scalars.title, async (candidate) => {
    const existing = await prisma.problem.findUnique({ where: { slug: candidate } });
    return existing !== null;
  });

  const problem = await prisma.problem.create({
    data: {
      ...scalars,
      slug,
      examples,
      status: "PUBLISHED",
      authorId: admin.id,
      testCases: {
        create: testCases.map((testCase, index) => ({
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          isSample: testCase.isSample,
          order: index,
        })),
      },
    },
  });

  return NextResponse.json({ problem }, { status: 201 });
}
