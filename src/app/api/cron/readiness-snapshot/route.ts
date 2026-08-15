import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeOverallReadiness, computeReadinessPillars } from "@/lib/readiness";
import { toISTDateKey } from "@/lib/streak";

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    select: { id: true },
  });

  const todayKey = toISTDateKey(new Date());
  let captured = 0;

  for (const student of students) {
    const existingToday = await prisma.readinessSnapshot.findFirst({
      where: { userId: student.id },
      orderBy: { capturedAt: "desc" },
      select: { capturedAt: true },
    });
    if (existingToday && toISTDateKey(existingToday.capturedAt) === todayKey) {
      continue;
    }

    const [overallScore, pillars] = await Promise.all([
      computeOverallReadiness(student.id),
      computeReadinessPillars(student.id),
    ]);

    await prisma.readinessSnapshot.create({
      data: {
        userId: student.id,
        overallScore,
        pillars: pillars as unknown as object,
      },
    });
    captured++;
  }

  return NextResponse.json({ checked: students.length, captured });
}
