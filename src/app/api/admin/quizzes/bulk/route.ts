import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { quizAuthorSchema } from "@/lib/validation";
import { uniqueSlug } from "@/lib/slugify";
import { parseSpreadsheet, groupConsecutiveRows, type RawRow } from "@/lib/bulkContentUpload";

export const maxDuration = 300;

const COLUMN_ALIASES: Record<string, string> = {
  quiztitle: "quizTitle",
  "quiz title": "quizTitle",
  topic: "topic",
  kind: "kind",
  requiredentitlement: "requiredEntitlement",
  "required entitlement": "requiredEntitlement",
  sectionname: "sectionName",
  "section name": "sectionName",
  sectiondurationminutes: "sectionDurationMinutes",
  "section duration minutes": "sectionDurationMinutes",
  "duration minutes": "sectionDurationMinutes",
  questiontext: "questionText",
  "question text": "questionText",
  questionmarks: "questionMarks",
  "question marks": "questionMarks",
  marks: "questionMarks",
  optiona: "optionA",
  "option a": "optionA",
  optionb: "optionB",
  "option b": "optionB",
  optionc: "optionC",
  "option c": "optionC",
  optiond: "optionD",
  "option d": "optionD",
  correctoption: "correctOption",
  "correct option": "correctOption",
  correct: "correctOption",
  explanation: "explanation",
  questionexplanation: "explanation",
  "question explanation": "explanation",
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
  let rows: RawRow[];
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

  const quizGroups = groupConsecutiveRows(rows, (row) => row.quizTitle ?? "");
  const invalid: RowResult[] = [];
  let createdCount = 0;

  for (const quizRows of quizGroups) {
    const first = quizRows[0];
    const identifier = first.quizTitle || `(no quiz title, row ${first.rowNumber})`;

    const sectionGroups = groupConsecutiveRows(quizRows, (row) => row.sectionName ?? "");
    const sections = sectionGroups.map((sectionRows, sIndex) => {
      const sFirst = sectionRows[0];
      return {
        name: sFirst.sectionName ?? "",
        durationMinutes: Number.parseInt(sFirst.sectionDurationMinutes ?? "", 10),
        order: sIndex,
        questions: sectionRows.map((row, qIndex) => {
          const correct = (row.correctOption ?? "").trim().toUpperCase();
          return {
            text: row.questionText ?? "",
            marks: Number.parseInt(row.questionMarks ?? "", 10),
            order: qIndex,
            explanation: row.explanation ?? "",
            options: (["A", "B", "C", "D"] as const).map((label) => ({
              label,
              text: row[`option${label}`] ?? "",
              isCorrect: label === correct,
            })),
          };
        }),
      };
    });

    const parsed = quizAuthorSchema.safeParse({
      title: first.quizTitle ?? "",
      topic: first.topic ?? "",
      kind: first.kind ?? "",
      requiredEntitlement: first.requiredEntitlement?.trim() || "FREE",
      order: 0,
      submit: true,
      sections,
    });
    if (!parsed.success) {
      invalid.push({
        row: first.rowNumber,
        identifier,
        reason: parsed.error.issues[0]?.message ?? "Invalid quiz",
      });
      continue;
    }

    const { submit, sections: parsedSections, ...scalars } = parsed.data;
    void submit;

    const slug = await uniqueSlug(scalars.title, async (candidate) => {
      const existing = await prisma.quiz.findUnique({ where: { slug: candidate } });
      return existing !== null;
    });

    try {
      await prisma.quiz.create({
        data: {
          ...scalars,
          slug,
          status: "PUBLISHED",
          authorId: admin.id,
          sections: {
            create: parsedSections.map((section) => ({
              name: section.name,
              durationMinutes: section.durationMinutes,
              order: section.order,
              questions: {
                create: section.questions.map((question) => ({
                  text: question.text,
                  marks: question.marks,
                  order: question.order,
                  explanation: question.explanation,
                  options: {
                    create: question.options.map((option) => ({
                      label: option.label,
                      text: option.text,
                      isCorrect: option.isCorrect,
                    })),
                  },
                })),
              },
            })),
          },
        },
      });
      createdCount++;
    } catch (err) {
      invalid.push({ row: first.rowNumber, identifier, reason: `Couldn't create: ${(err as Error).message}` });
    }
  }

  return NextResponse.json({ created: createdCount, skipped: [], invalid });
}
