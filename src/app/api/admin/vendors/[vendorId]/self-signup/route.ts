import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { parseBody } from "@/lib/api";
import { vendorSelfSignupSchema } from "@/lib/validation";

function generateSlug(): string {
  return crypto.randomBytes(6).toString("hex");
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ vendorId: string }> }
) {
  const actor = await requireRole(["SUPER_ADMIN", "ADMIN"]);
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { vendorId } = await params;
  const parsed = await parseBody(request, vendorSelfSignupSchema);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
  if (!vendor) {
    return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
  }

  // The slug is kept once generated, even across disable/re-enable, so a
  // vendor's previously distributed link keeps working if they turn it back on.
  let signupSlug = vendor.signupSlug;
  if (parsed.data.enabled && !signupSlug) {
    let candidate = generateSlug();
    while (await prisma.vendor.findUnique({ where: { signupSlug: candidate } })) {
      candidate = generateSlug();
    }
    signupSlug = candidate;
  }

  const updated = await prisma.vendor.update({
    where: { id: vendorId },
    data: { selfSignupEnabled: parsed.data.enabled, signupSlug },
  });

  return NextResponse.json({
    selfSignupEnabled: updated.selfSignupEnabled,
    signupSlug: updated.signupSlug,
  });
}
