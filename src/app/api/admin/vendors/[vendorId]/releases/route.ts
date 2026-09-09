import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { scheduledReleaseSchema } from "@/lib/validation";
import { fetchLeetCodeQuestion } from "@/lib/externalJudge";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ vendorId: string }> }
) {
  const actor = await requireRole(["SUPER_ADMIN", "ADMIN"]);
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { vendorId } = await params;
  const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
  if (!vendor) {
    return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = scheduledReleaseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }

  if (parsed.data.quizId) {
    const quiz = await prisma.quiz.findUnique({ where: { id: parsed.data.quizId } });
    if (!quiz || quiz.status !== "PUBLISHED") {
      return NextResponse.json({ error: "Quiz not found or not published" }, { status: 400 });
    }
  }
  if (parsed.data.problemId) {
    const problem = await prisma.problem.findUnique({ where: { id: parsed.data.problemId } });
    if (!problem || problem.status !== "PUBLISHED") {
      return NextResponse.json({ error: "Problem not found or not published" }, { status: 400 });
    }
  }

  let externalProblemTitle: string | null = null;
  if (parsed.data.externalProblemSlug) {
    let question;
    try {
      question = await fetchLeetCodeQuestion(parsed.data.externalProblemSlug);
    } catch (err) {
      return NextResponse.json(
        { error: "Couldn't reach LeetCode to verify that problem — try again", detail: (err as Error).message },
        { status: 503 }
      );
    }
    if (!question) {
      return NextResponse.json(
        { error: "That LeetCode problem slug wasn't found" },
        { status: 400 }
      );
    }
    externalProblemTitle = question.title;
  }

  const releasedAt = new Date();
  const closesAt = new Date(releasedAt.getTime() + parsed.data.windowMinutes * 60_000);

  const release = await prisma.scheduledRelease.create({
    data: {
      vendorId,
      quizId: parsed.data.quizId ?? null,
      problemId: parsed.data.problemId ?? null,
      externalPlatform: parsed.data.externalProblemSlug ? "LEETCODE" : null,
      externalProblemSlug: parsed.data.externalProblemSlug ?? null,
      externalProblemTitle,
      releasedAt,
      windowMinutes: parsed.data.windowMinutes,
      closesAt,
    },
  });

  return NextResponse.json({ release }, { status: 201 });
}
