import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ vendorId: string; recordId: string }> }
) {
  const actor = await requireRole(["SUPER_ADMIN", "ADMIN"]);
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { vendorId, recordId } = await params;
  const record = await prisma.vendorBillingRecord.findUnique({ where: { id: recordId } });
  if (!record || record.vendorId !== vendorId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.vendorBillingRecord.update({
    where: { id: recordId },
    data: { status: "INVOICED" },
  });

  return NextResponse.json({ record: updated });
}
