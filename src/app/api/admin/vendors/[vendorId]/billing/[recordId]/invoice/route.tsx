import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import VendorInvoiceDocument from "@/components/admin/VendorInvoiceDocument";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ vendorId: string; recordId: string }> }
) {
  const actor = await requireRole(["SUPER_ADMIN", "ADMIN"]);
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { vendorId, recordId } = await params;
  const record = await prisma.vendorBillingRecord.findUnique({
    where: { id: recordId },
    include: { vendor: true },
  });
  if (!record || record.vendorId !== vendorId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const buffer = await renderToBuffer(
    <VendorInvoiceDocument
      vendorName={record.vendor.name}
      vendorContactEmail={record.vendor.contactEmail}
      periodMonth={record.periodMonth}
      activeStudentCount={record.activeStudentCount}
      ratePaisePerStudent={record.ratePaisePerStudent}
      totalAmountPaise={record.totalAmountPaise}
      status={record.status}
      finalizedAt={record.finalizedAt}
      generatedAt={new Date()}
    />
  );

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${record.vendor.name}-${record.periodMonth}-invoice.pdf"`,
    },
  });
}
