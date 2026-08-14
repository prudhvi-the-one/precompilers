import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { runSubmitSchema } from "@/lib/validation";
import { meetsEntitlement } from "@/lib/entitlement";
import { submitSolution } from "@/lib/judge";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ problemId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { problemId } = await params;
  const body = await request.json().catch(() => null);
  const parsed = runSubmitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }

  const problem = await prisma.problem.findUnique({ where: { id: problemId } });
  if (!problem || problem.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!meetsEntitlement(user.entitlement, problem.requiredEntitlement)) {
    return NextResponse.json({ error: "Upgrade required" }, { status: 403 });
  }

  try {
    const { submission, results } = await submitSolution(
      problemId,
      user.id,
      parsed.data.language,
      parsed.data.sourceCode
    );
    // Hidden test cases' input/expectedOutput must never reach the client —
    // only sample cases get full detail; hidden cases report pass/fail only.
    const safeResults = results.map((r) =>
      r.isSample
        ? r
        : { isSample: false, passed: r.passed, input: null, expectedOutput: null, actualOutput: null }
    );
    return NextResponse.json({ submission, results: safeResults });
  } catch {
    return NextResponse.json(
      { error: "Judge temporarily unavailable. Try again in a moment." },
      { status: 503 }
    );
  }
}
