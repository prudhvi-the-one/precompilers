import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { applicationStatusSchema } from "@/lib/validation";
import { parseBody } from "@/lib/api";
import { notifyUser } from "@/lib/notifications";
import { hasTierAccess } from "@/lib/tier";

const STATUS_LABEL: Record<string, string> = {
  APPLIED: "Applied",
  INTERVIEWING: "Interviewing",
  OFFER: "Offer",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!(await hasTierAccess(user, "CAREER"))) {
    return NextResponse.json({ error: "Upgrade required" }, { status: 403 });
  }

  const { id } = await params;
  const application = await prisma.application.findUnique({ where: { id } });
  if (!application || application.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const parsed = await parseBody(request, applicationStatusSchema);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const { status, notes, deadline } = parsed.data;
  const statusChanged = status !== application.status;

  const updated = await prisma.application.update({
    where: { id },
    data: {
      status,
      notes: notes !== undefined ? notes : undefined,
      deadline: deadline !== undefined ? (deadline ? new Date(deadline) : null) : undefined,
    },
  });

  if (statusChanged) {
    await notifyUser({
      userId: user.id,
      type: "APPLICATION_STATUS_CHANGED",
      title: `${updated.companyName} application updated`,
      body: `You marked your ${updated.roleTitle} application as ${STATUS_LABEL[status]}.`,
      link: "/career/applications",
      phoneNumber: user.phoneNumber,
      whatsappOptIn: user.whatsappOptIn,
    });
  }

  return NextResponse.json({ application: updated });
}
