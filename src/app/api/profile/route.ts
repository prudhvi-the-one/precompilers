import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { profileUpdateSchema } from "@/lib/validation";
import { parseBody } from "@/lib/api";

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = await parseBody(request, profileUpdateSchema);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const { name, college, branch, gradYear } = parsed.data;

  const user = await prisma.user.update({
    where: { id: session.userId },
    data: {
      name: name || null,
      college: college || null,
      branch: branch || null,
      gradYear: gradYear ?? null,
    },
  });

  return NextResponse.json({
    success: true,
    name: user.name,
    college: user.college,
    branch: user.branch,
    gradYear: user.gradYear,
  });
}
