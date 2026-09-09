import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { parseBody } from "@/lib/api";
import { adminEditStudentSchema } from "@/lib/validation";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const actor = await requireRole(["SUPER_ADMIN", "ADMIN"]);
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = await params;
  const parsed = await parseBody(request, adminEditStudentSchema);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const {
    name,
    email,
    college,
    branch,
    rollNumber,
    gradYear,
    cgpa,
    backlogCount,
    weeklyHours,
    targetRole,
    phoneNumber,
    whatsappOptIn,
    vendorId,
  } = parsed.data;

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (vendorId) {
    const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }
  }

  const effectiveVendorId = vendorId !== undefined ? vendorId : target.vendorId;
  const effectiveRollNumber = rollNumber !== undefined ? rollNumber : target.rollNumber;
  if (effectiveVendorId && effectiveRollNumber) {
    const duplicate = await prisma.user.findUnique({
      where: { vendorId_rollNumber: { vendorId: effectiveVendorId, rollNumber: effectiveRollNumber } },
    });
    if (duplicate && duplicate.id !== userId) {
      return NextResponse.json(
        { error: "A student with that roll number already exists for this vendor" },
        { status: 400 }
      );
    }
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      name: name !== undefined ? name || null : undefined,
      email,
      college: college !== undefined ? college || null : undefined,
      branch: branch !== undefined ? branch || null : undefined,
      rollNumber: rollNumber !== undefined ? rollNumber || null : undefined,
      gradYear,
      cgpa,
      backlogCount,
      weeklyHours: weeklyHours !== undefined ? weeklyHours || null : undefined,
      targetRole,
      phoneNumber: phoneNumber !== undefined ? phoneNumber || null : undefined,
      whatsappOptIn,
      vendorId,
    },
  });

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    college: user.college,
    branch: user.branch,
    rollNumber: user.rollNumber,
    gradYear: user.gradYear,
    cgpa: user.cgpa,
    backlogCount: user.backlogCount,
    weeklyHours: user.weeklyHours,
    targetRole: user.targetRole,
    phoneNumber: user.phoneNumber,
    whatsappOptIn: user.whatsappOptIn,
    vendorId: user.vendorId,
  });
}
