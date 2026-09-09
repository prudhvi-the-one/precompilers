import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { forceSubmitAllRemainingSections } from "@/lib/quiz";

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  const closedReleases = await prisma.scheduledRelease.findMany({
    where: { quizId: { not: null }, closesAt: { lte: now } },
    select: { vendorId: true, quizId: true },
  });

  let forceSubmitted = 0;
  for (const release of closedReleases) {
    if (!release.quizId) continue;
    const openAttempts = await prisma.quizAttempt.findMany({
      where: {
        quizId: release.quizId,
        submittedAt: null,
        user: { vendorId: release.vendorId },
      },
      select: { id: true },
    });
    for (const attempt of openAttempts) {
      await forceSubmitAllRemainingSections(attempt.id);
      forceSubmitted++;
    }
  }

  return NextResponse.json({ closedReleasesChecked: closedReleases.length, forceSubmitted });
}
