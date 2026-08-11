import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { runSubmitSchema } from "@/lib/validation";
import { runSample } from "@/lib/judge";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ problemId: string }> }
) {
  const session = await getSession();
  if (!session) {
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

  const problem = await prisma.problem.findUnique({
    where: { id: problemId },
    include: { testCases: { where: { isSample: true } } },
  });
  if (!problem) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const { results } = await runSample(
      problem,
      parsed.data.language,
      parsed.data.sourceCode
    );
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json(
      { error: "Judge temporarily unavailable. Try again in a moment." },
      { status: 503 }
    );
  }
}
