import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { computeActiveStudentCount, currentPeriodMonth } from "@/lib/vendorBilling";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ vendorId: string }> }
) {
  const actor = await requireRole(["SUPER_ADMIN", "ADMIN"]);
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { vendorId } = await params;
  const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
  if (!vendor) {
    return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const periodMonth = body?.periodMonth;
  if (typeof periodMonth !== "string" || !/^\d{4}-\d{2}$/.test(periodMonth)) {
    return NextResponse.json({ error: "periodMonth must be in YYYY-MM format" }, { status: 400 });
  }
  if (periodMonth >= currentPeriodMonth()) {
    return NextResponse.json(
      { error: "Only a fully completed past month can be finalized" },
      { status: 400 }
    );
  }

  const existing = await prisma.vendorBillingRecord.findUnique({
    where: { vendorId_periodMonth: { vendorId, periodMonth } },
  });
  if (existing) {
    return NextResponse.json(
      { error: `${periodMonth} has already been finalized for this vendor` },
      { status: 400 }
    );
  }

  const activeStudentCount = await computeActiveStudentCount(vendorId, periodMonth);
  const totalAmountPaise = activeStudentCount * vendor.ratePaisePerStudent;

  const record = await prisma.vendorBillingRecord.create({
    data: {
      vendorId,
      periodMonth,
      activeStudentCount,
      ratePaisePerStudent: vendor.ratePaisePerStudent,
      totalAmountPaise,
      status: "FINALIZED",
    },
  });

  return NextResponse.json({ record }, { status: 201 });
}
