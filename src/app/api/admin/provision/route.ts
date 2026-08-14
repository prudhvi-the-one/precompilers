import { NextResponse } from "next/server";
import { requireRole } from "@/lib/session";
import { provisionUser } from "@/lib/provisioning";

export async function POST(request: Request) {
  const actor = await requireRole(["SUPER_ADMIN", "ADMIN", "INSTITUTION_ADMIN"]);
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.email || !body?.name || !body?.role) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const result = await provisionUser(actor, {
    email: body.email,
    name: body.name,
    role: body.role,
    institutionId: body.institutionId,
    facultyBatchId: body.facultyBatchId,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ userId: result.userId });
}
