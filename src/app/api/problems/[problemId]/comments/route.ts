import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { problemCommentSchema } from "@/lib/validation";
import { hasTierAccess } from "@/lib/tier";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ problemId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!(await hasTierAccess(user, "PRACTICE"))) {
    return NextResponse.json({ error: "Upgrade required" }, { status: 403 });
  }

  const { problemId } = await params;
  const body = await request.json().catch(() => null);
  const parsed = problemCommentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid comment" },
      { status: 400 }
    );
  }

  const problem = await prisma.problem.findUnique({ where: { id: problemId } });
  if (!problem || problem.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const comment = await prisma.comment.create({
    data: { problemId, userId: session.userId, body: parsed.data.body },
    include: { user: { select: { name: true, email: true } } },
  });

  return NextResponse.json({ comment });
}
