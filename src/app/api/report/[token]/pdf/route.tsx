import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { computeReadinessPillars, computeOverallReadiness } from "@/lib/readiness";
import ReadinessReportDocument from "@/components/career/ReadinessReportDocument";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const user = await prisma.user.findUnique({ where: { reportShareToken: token } });
  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [pillars, overall] = await Promise.all([
    computeReadinessPillars(user.id),
    computeOverallReadiness(user.id),
  ]);

  const buffer = await renderToBuffer(
    <ReadinessReportDocument
      name={user.name ?? "PreCompilers student"}
      college={user.college}
      branch={user.branch}
      gradYear={user.gradYear}
      targetRole={user.targetRole}
      overall={overall}
      pillars={pillars}
      generatedAt={new Date()}
    />
  );

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="readiness-report.pdf"`,
    },
  });
}
