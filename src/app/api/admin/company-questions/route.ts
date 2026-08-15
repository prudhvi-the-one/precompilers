import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { companyQuestionSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = companyQuestionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }

  const { submit, ...scalars } = parsed.data;
  void submit;

  const companyQuestion = await prisma.companyQuestion.create({
    data: {
      ...scalars,
      status: "PUBLISHED",
      authorId: admin.id,
    },
  });

  return NextResponse.json({ companyQuestion }, { status: 201 });
}
