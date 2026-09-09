import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { computeVendorCompletionPercent } from "@/lib/vendorCompletion";
import VendorCertificateDocument from "@/components/vendor/VendorCertificateDocument";

export async function GET(
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

  const certificate = await prisma.certificate.findUnique({
    where: { userId_vendorId: { userId, vendorId } },
    include: { vendor: true, user: true },
  });
  if (!certificate) {
    return NextResponse.json({ error: "Not issued yet" }, { status: 404 });
  }

  const completionPercent = await computeVendorCompletionPercent(vendorId, userId);
  const buffer = await renderToBuffer(
    <VendorCertificateDocument
      studentName={certificate.user.name ?? certificate.user.email}
      vendorName={certificate.vendor.name}
      completionPercent={completionPercent}
      issuedAt={certificate.issuedAt}
    />
  );

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${certificate.vendor.name}-${certificate.user.email}-certificate.pdf"`,
    },
  });
}
