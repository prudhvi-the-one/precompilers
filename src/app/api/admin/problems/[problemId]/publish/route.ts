import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { verifyReferenceSolution } from "@/lib/judge";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ problemId: string }> }
) {
  const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { problemId } = await params;
  const problem = await prisma.problem.findUnique({
    where: { id: problemId },
    include: { testCases: true },
  });
  if (!problem) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (problem.status !== "DRAFT") {
    return NextResponse.json({ error: "Only draft problems can be published this way" }, {
      status: 409,
    });
  }
  if (!problem.referenceSolutionLanguage || !problem.referenceSolutionCode?.trim()) {
    return NextResponse.json(
      { error: "This draft has no reference solution to verify against." },
      { status: 400 }
    );
  }

  let verification;
  try {
    verification = await verifyReferenceSolution(
      problem.referenceSolutionLanguage,
      problem.referenceSolutionCode,
      problem.testCases
    );
  } catch (err) {
    return NextResponse.json(
      {
        error:
          "The judge service is temporarily unavailable (likely rate-limited) — still a draft, try again later.",
        detail: (err as Error).message,
      },
      { status: 503 }
    );
  }
  if (!verification.passed) {
    return NextResponse.json(
      {
        error:
          "Your reference solution didn't pass all test cases — still a draft, try again later.",
        verification,
      },
      { status: 422 }
    );
  }

  const updated = await prisma.problem.update({
    where: { id: problemId },
    data: { status: "PUBLISHED" },
  });

  return NextResponse.json({ problem: updated });
}
