import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { problemAuthorSchema } from "@/lib/validation";
import { uniqueSlug } from "@/lib/slugify";
import { parseSpreadsheet, groupConsecutiveRows, splitList, parseBoolean, type RawRow } from "@/lib/bulkContentUpload";

export const maxDuration = 300;

const COLUMN_ALIASES: Record<string, string> = {
  title: "title",
  difficulty: "difficulty",
  category: "category",
  tags: "tags",
  companies: "companies",
  statement: "statement",
  constraints: "constraints",
  hints: "hints",
  solutionexplanation: "solutionExplanation",
  "solution explanation": "solutionExplanation",
  referencesolutionlanguage: "referenceSolutionLanguage",
  "reference solution language": "referenceSolutionLanguage",
  referencesolutioncode: "referenceSolutionCode",
  "reference solution code": "referenceSolutionCode",
  testcaseinput: "testCaseInput",
  "test case input": "testCaseInput",
  testcaseexpectedoutput: "testCaseExpectedOutput",
  "test case expected output": "testCaseExpectedOutput",
  "expected output": "testCaseExpectedOutput",
  testcaseissample: "testCaseIsSample",
  "test case is sample": "testCaseIsSample",
  "is sample": "testCaseIsSample",
  testcaseexplanation: "testCaseExplanation",
  "test case explanation": "testCaseExplanation",
  explanation: "testCaseExplanation",
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

  const problemGroups = groupConsecutiveRows(rows, (row) => row.title ?? "");
  const invalid: RowResult[] = [];
  let createdCount = 0;

  for (const problemRows of problemGroups) {
    const first = problemRows[0];
    const identifier = first.title || `(no title, row ${first.rowNumber})`;

    const testCases = problemRows.map((row) => ({
      input: row.testCaseInput ?? "",
      expectedOutput: row.testCaseExpectedOutput ?? "",
      isSample: parseBoolean(row.testCaseIsSample ?? ""),
    }));
    const examples = problemRows
      .filter((row) => parseBoolean(row.testCaseIsSample ?? ""))
      .map((row) => ({
        input: row.testCaseInput ?? "",
        output: row.testCaseExpectedOutput ?? "",
        explanation: row.testCaseExplanation ?? "",
      }));

    const parsed = problemAuthorSchema.safeParse({
      title: first.title ?? "",
      difficulty: first.difficulty ?? "",
      category: first.category ?? "",
      tags: splitList(first.tags ?? ""),
      companies: splitList(first.companies ?? ""),
      statement: first.statement ?? "",
      examples,
      constraints: first.constraints ?? "",
      hints: first.hints ?? "",
      solutionExplanation: first.solutionExplanation ?? "",
      referenceSolutionLanguage: first.referenceSolutionLanguage?.trim() || undefined,
      referenceSolutionCode: first.referenceSolutionCode ?? "",
      requiredEntitlement: "FREE",
      order: 0,
      submit: true,
      testCases,
    });
    if (!parsed.success) {
      invalid.push({
        row: first.rowNumber,
        identifier,
        reason: parsed.error.issues[0]?.message ?? "Invalid problem",
      });
      continue;
    }

    const { submit, testCases: parsedTestCases, examples: parsedExamples, ...scalars } = parsed.data;
    void submit;

    const slug = await uniqueSlug(scalars.title, async (candidate) => {
      const existing = await prisma.problem.findUnique({ where: { slug: candidate } });
      return existing !== null;
    });

    try {
      await prisma.problem.create({
        data: {
          ...scalars,
          slug,
          examples: parsedExamples,
          // Bulk-imported problems always land as drafts, regardless of how
          // complete the row is — the reference solution is validated for
          // presence here but never run against the judge synchronously for
          // a whole batch. Each row is verified and published individually
          // afterward via the existing "Try publish" action.
          status: "DRAFT",
          authorId: admin.id,
          testCases: {
            create: parsedTestCases.map((testCase, index) => ({
              input: testCase.input,
              expectedOutput: testCase.expectedOutput,
              isSample: testCase.isSample,
              order: index,
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
