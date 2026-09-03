import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { computeVendorCompletionPercent } from "@/lib/vendorCompletion";
import VendorCertificateDocument from "@/components/vendor/VendorCertificateDocument";

export async function GET() {
  const user = await requireRole("STUDENT");
  if (!user || !user.vendorId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const certificate = await prisma.certificate.findUnique({
    where: { userId_vendorId: { userId: user.id, vendorId: user.vendorId } },
    include: { vendor: true },
  });
  if (!certificate) {
    return NextResponse.json({ error: "Not issued yet" }, { status: 404 });
  }

  const completionPercent = await computeVendorCompletionPercent(user.vendorId, user.id);
  const buffer = await renderToBuffer(
    <VendorCertificateDocument
      studentName={user.name ?? user.email}
      vendorName={certificate.vendor.name}
      completionPercent={completionPercent}
      issuedAt={certificate.issuedAt}
    />
  );

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${certificate.vendor.name}-certificate.pdf"`,
    },
  });
}
