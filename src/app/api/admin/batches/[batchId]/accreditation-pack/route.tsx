import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { computeBatchAttendanceRegister } from "@/lib/attendance";
import { computeOverallReadiness, computeReadinessPillars } from "@/lib/readiness";
import { computeCohortStats } from "@/lib/cohort";
import AccreditationPackDocument from "@/components/admin/AccreditationPackDocument";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ batchId: string }> }
) {
  const actor = await requireRole(["ADMIN", "SUPER_ADMIN", "INSTITUTION_ADMIN"]);
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { batchId } = await params;
  const format = new URL(request.url).searchParams.get("format");
  if (format !== "pdf" && format !== "xlsx") {
    return NextResponse.json({ error: "format must be pdf or xlsx" }, { status: 400 });
  }

  const batch = await prisma.batch.findUnique({
    where: { id: batchId },
    include: { track: true, institution: true },
  });
  if (!batch) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (actor.role === "INSTITUTION_ADMIN" && batch.institutionId !== actor.institutionId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const register = await computeBatchAttendanceRegister(batchId);
  const studentIds = register.perStudent.map((s) => s.userId);
  const [overallScores, pillarsByStudent, cohortStats] = await Promise.all([
    Promise.all(studentIds.map((id) => computeOverallReadiness(id))),
    Promise.all(studentIds.map((id) => computeReadinessPillars(id))),
    computeCohortStats(studentIds),
  ]);

  const studentSummaries = register.perStudent.map((s, index) => ({
    ...s,
    overallReadiness: overallScores[index],
    pillars: pillarsByStudent[index],
  }));

  const fileBase = `${batch.name.replace(/[^a-z0-9]+/gi, "-")}-accreditation-pack`;

  if (format === "xlsx") {
    const workbook = new ExcelJS.Workbook();

    const attendanceSheet = workbook.addWorksheet("Attendance Register");
    attendanceSheet.columns = [
      { header: "Session", key: "title", width: 32 },
      { header: "Date", key: "date", width: 14 },
      { header: "Present", key: "present", width: 10 },
      { header: "Enrolled", key: "enrolled", width: 10 },
      { header: "% Present", key: "pct", width: 10 },
    ];
    for (const session of register.sessions) {
      attendanceSheet.addRow({
        title: session.title,
        date: session.scheduledAt.toISOString().slice(0, 10),
        present: session.presentCount,
        enrolled: session.totalEnrolled,
        pct: session.pctPresent,
      });
    }

    const pillarLabels = pillarsByStudent[0]?.map((p) => p.label) ?? [];
    const readinessSheet = workbook.addWorksheet("Readiness Summary");
    readinessSheet.columns = [
      { header: "Student", key: "name", width: 24 },
      { header: "Email", key: "email", width: 28 },
      { header: "Attendance %", key: "attendance", width: 14 },
      { header: "Overall Readiness", key: "overall", width: 16 },
      ...pillarLabels.map((label, index) => ({ header: label, key: `pillar${index}`, width: 20 })),
    ];
    for (const s of studentSummaries) {
      const row: Record<string, string | number> = {
        name: s.name ?? s.email,
        email: s.email,
        attendance: s.pctPresent ?? "",
        overall: s.overallReadiness ?? "",
      };
      s.pillars.forEach((p, index) => {
        row[`pillar${index}`] = p.value ?? "";
      });
      readinessSheet.addRow(row);
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${fileBase}.xlsx"`,
      },
    });
  }

  const buffer = await renderToBuffer(
    <AccreditationPackDocument
      batchName={batch.name}
      trackName={batch.track.name}
      institutionName={batch.institution?.name ?? null}
      generatedAt={new Date()}
      register={register}
      studentSummaries={studentSummaries}
      cohortStats={cohortStats}
    />
  );
  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileBase}.pdf"`,
    },
  });
}
