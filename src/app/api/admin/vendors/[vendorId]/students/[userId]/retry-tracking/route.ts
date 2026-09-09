import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { pollExternalJudgeAccountOnce } from "@/lib/externalJudge";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ vendorId: string; userId: string }> }
) {
  const actor = await getCurrentUser();
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { vendorId, userId } = await params;
  const isStaff = actor.role === "ADMIN" || actor.role === "SUPER_ADMIN";
  const isOwnVendorAdmin = actor.role === "VENDOR_ADMIN" && actor.vendorId === vendorId;
  if (!isStaff && !isOwnVendorAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const student = await prisma.user.findUnique({ where: { id: userId } });
  if (!student || student.vendorId !== vendorId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const account = await prisma.externalJudgeAccount.findUnique({
    where: { userId_platform: { userId, platform: "LEETCODE" } },
  });
  if (!account || account.trackingStatus !== "BLOCKED_OR_PRIVATE") {
    return NextResponse.json({ error: "Nothing to retry for this student" }, { status: 400 });
  }

  const result = await pollExternalJudgeAccountOnce(account);
  if (result.outcome === "polled") {
    return NextResponse.json({ trackingStatus: "ACTIVE", newSubmissions: result.newSubmissions });
  }
  if (result.outcome === "blocked") {
    return NextResponse.json(
      { trackingStatus: "BLOCKED_OR_PRIVATE", error: "Still private — the student needs to fix their LeetCode privacy setting" },
      { status: 200 }
    );
  }
  return NextResponse.json({ error: "LeetCode request failed, try again shortly" }, { status: 502 });
}
