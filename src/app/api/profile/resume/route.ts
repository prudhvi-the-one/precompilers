import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { resumeSchema } from "@/lib/validation";
import { hasTierAccess } from "@/lib/tier";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!(await hasTierAccess(user, "CAREER"))) {
    return NextResponse.json({ error: "Upgrade required" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = resumeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }

  const { education, experience, projects, ...scalars } = parsed.data;

  const existing = await prisma.resume.findUnique({ where: { userId: user.id } });

  const nestedData = {
    education: {
      create: education.map((e, index) => ({ ...e, order: index })),
    },
    experience: {
      create: experience.map((e, index) => ({ ...e, order: index })),
    },
    projects: {
      create: projects.map((p, index) => ({ ...p, order: index })),
    },
  };

  const resume = existing
    ? await prisma.$transaction(async (tx) => {
        await tx.resumeEducation.deleteMany({ where: { resumeId: existing.id } });
        await tx.resumeExperience.deleteMany({ where: { resumeId: existing.id } });
        await tx.resumeProject.deleteMany({ where: { resumeId: existing.id } });
        return tx.resume.update({
          where: { id: existing.id },
          data: { ...scalars, ...nestedData },
        });
      })
    : await prisma.resume.create({
        data: { ...scalars, userId: user.id, ...nestedData },
      });

  return NextResponse.json({ resume });
}
