import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyUser } from "@/lib/notifications";

const REMINDER_WINDOW_MS = 2 * 24 * 60 * 60 * 1000;

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const windowEnd = new Date(now.getTime() + REMINDER_WINDOW_MS);

  const candidates = await prisma.application.findMany({
    where: {
      status: "APPLIED",
      deadlineReminderSentAt: null,
      OR: [
        { deadline: { gte: now, lte: windowEnd } },
        { drive: { applyDeadline: { gte: now, lte: windowEnd } } },
      ],
    },
    include: {
      drive: { select: { applyDeadline: true } },
      user: { select: { id: true, phoneNumber: true, whatsappOptIn: true } },
    },
  });

  let sent = 0;
  for (const application of candidates) {
    const effectiveDeadline = application.drive?.applyDeadline ?? application.deadline;
    if (!effectiveDeadline || effectiveDeadline < now || effectiveDeadline > windowEnd) {
      continue;
    }

    await notifyUser({
      userId: application.user.id,
      type: "DEADLINE_REMINDER",
      title: `Deadline approaching: ${application.companyName}`,
      body: `Your ${application.roleTitle} application deadline is ${effectiveDeadline.toDateString()}.`,
      link: "/career/applications",
      phoneNumber: application.user.phoneNumber,
      whatsappOptIn: application.user.whatsappOptIn,
    });

    await prisma.application.update({
      where: { id: application.id },
      data: { deadlineReminderSentAt: now },
    });
    sent++;
  }

  return NextResponse.json({ checked: candidates.length, sent });
}
