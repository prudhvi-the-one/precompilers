import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { problemAuthorSchema } from "@/lib/validation";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ problemId: string }> }
) {
  const mentor = await requireRole("MENTOR");
  if (!mentor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { problemId } = await params;
  const problem = await prisma.problem.findUnique({ where: { id: problemId } });
  if (!problem || problem.authorId !== mentor.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (problem.status !== "DRAFT" && problem.status !== "REJECTED") {
    return NextResponse.json(
      { error: "Cannot edit content that is under review or published" },
      { status: 409 }
    );
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

  const updated = await prisma.$transaction(async (tx) => {
    await tx.testCase.deleteMany({ where: { problemId } });
    return tx.problem.update({
      where: { id: problemId },
      data: {
        ...scalars,
        examples,
        status: submit ? "PENDING_REVIEW" : "DRAFT",
        submittedAt: submit ? new Date() : null,
        rejectionReason: null,
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
  });

  return NextResponse.json({ problem: updated });
}
