import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { parseBody } from "@/lib/api";
import { certificateCriteriaSchema } from "@/lib/validation";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ vendorId: string }> }
) {
  const actor = await requireRole(["SUPER_ADMIN", "ADMIN"]);
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { vendorId } = await params;
  const parsed = await parseBody(request, certificateCriteriaSchema);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const vendor = await prisma.vendor.update({
    where: { id: vendorId },
    data: { certificateCriteria: { minCompletionPercent: parsed.data.minCompletionPercent } },
  });

  return NextResponse.json({ certificateCriteria: vendor.certificateCriteria });
}
