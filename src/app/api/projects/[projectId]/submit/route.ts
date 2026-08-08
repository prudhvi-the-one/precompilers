import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { projectSubmissionSchema } from "@/lib/validation";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;
  const body = await request.json().catch(() => null);
  const parsed = projectSubmissionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid submission" },
      { status: 400 }
    );
  }

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.projectSubmission.upsert({
    where: { projectId_userId: { projectId, userId: session.userId } },
    update: { ...parsed.data, submittedAt: new Date() },
    create: { projectId, userId: session.userId, ...parsed.data },
  });

  return NextResponse.json({ success: true });
}
