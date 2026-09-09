import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { computeVendorCompletionPercent, parseCertificateCriteria } from "@/lib/vendorCompletion";

export async function POST() {
  const user = await requireRole("STUDENT");
  if (!user || !user.vendorId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.certificate.findUnique({
    where: { userId_vendorId: { userId: user.id, vendorId: user.vendorId } },
  });
  if (existing) {
    return NextResponse.json({ certificate: existing });
  }

  const vendor = await prisma.vendor.findUnique({ where: { id: user.vendorId } });
  const criteria = vendor ? parseCertificateCriteria(vendor.certificateCriteria) : null;
  if (!criteria) {
    return NextResponse.json({ error: "This vendor hasn't set completion criteria yet" }, { status: 400 });
  }

  const completionPercent = await computeVendorCompletionPercent(user.vendorId, user.id);
  if (completionPercent < criteria.minCompletionPercent) {
    return NextResponse.json(
      { error: `Not eligible yet — ${completionPercent}% complete, ${criteria.minCompletionPercent}% required` },
      { status: 400 }
    );
  }

  const certificate = await prisma.certificate.create({
    data: { userId: user.id, vendorId: user.vendorId },
  });
  return NextResponse.json({ certificate }, { status: 201 });
}
