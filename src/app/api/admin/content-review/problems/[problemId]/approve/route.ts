import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ problemId: string }> }
) {
  const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { problemId } = await params;
  const problem = await prisma.problem.findUnique({ where: { id: problemId } });
  if (!problem) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (problem.status !== "PENDING_REVIEW") {
    return NextResponse.json({ error: "This item is not awaiting review" }, { status: 409 });
  }

  const updated = await prisma.problem.update({
    where: { id: problemId },
    data: {
      status: "PUBLISHED",
      reviewedById: admin.id,
      reviewedAt: new Date(),
      rejectionReason: null,
    },
  });

  return NextResponse.json({ problem: updated });
}
