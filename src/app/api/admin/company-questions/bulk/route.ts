import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { companyQuestionSchema } from "@/lib/validation";
import { parseSpreadsheet } from "@/lib/bulkContentUpload";

export const maxDuration = 300;

const COLUMN_ALIASES: Record<string, string> = {
  companyname: "companyName",
  "company name": "companyName",
  category: "category",
  question: "question",
  guidance: "guidance",
  "ideal answer": "guidance",
};

type RowResult = { row: number; identifier: string; reason: string };

export async function POST(request: Request) {
  const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  let rows;
  try {
    rows = await parseSpreadsheet(buffer, file.name, COLUMN_ALIASES);
  } catch (err) {
    return NextResponse.json(
      { error: `Couldn't read that file: ${(err as Error).message}` },
      { status: 400 }
    );
  }
  if (rows.length === 0) {
    return NextResponse.json({ error: "No data rows found in the file" }, { status: 400 });
  }

  const invalid: RowResult[] = [];
  const candidates: { rowNumber: number; data: ReturnType<typeof companyQuestionSchema.parse> }[] = [];

  for (const raw of rows) {
    const parsed = companyQuestionSchema.safeParse({
      companyName: raw.companyName ?? "",
      category: raw.category ?? "",
      question: raw.question ?? "",
      guidance: raw.guidance ?? "",
      submit: true,
    });
    if (!parsed.success) {
      invalid.push({
        row: raw.rowNumber,
        identifier: raw.companyName || "(no company name)",
        reason: parsed.error.issues[0]?.message ?? "Invalid row",
      });
      continue;
    }
    candidates.push({ rowNumber: raw.rowNumber, data: parsed.data });
  }

  let createdCount = 0;
  if (candidates.length > 0) {
    const created = await prisma.companyQuestion.createManyAndReturn({
      data: candidates.map((c) => ({
        companyName: c.data.companyName,
        category: c.data.category,
        question: c.data.question,
        guidance: c.data.guidance,
        status: "PUBLISHED" as const,
        authorId: admin.id,
      })),
      select: { id: true },
    });
    createdCount = created.length;
  }

  return NextResponse.json({ created: createdCount, skipped: [], invalid });
}
