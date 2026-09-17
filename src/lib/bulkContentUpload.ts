import { Readable } from "stream";
import ExcelJS from "exceljs";

export type RawRow = { rowNumber: number } & Record<string, string>;

function cellText(cell: ExcelJS.Cell | undefined): string {
  if (!cell || cell.value === null || cell.value === undefined) return "";
  if (typeof cell.value === "object" && "richText" in cell.value) {
    return (cell.value.richText as { text: string }[]).map((t) => t.text).join("");
  }
  return String(cell.value).trim();
}

// Generic CSV/XLSX reader shared by every content-type bulk importer: columns
// are matched by header text (via a caller-supplied alias map), not position,
// same tolerance as parseRosterFile. Each row is returned as a flat string
// map keyed by the aliased field name — grouping and validation happen
// downstream, per content type.
export async function parseSpreadsheet(
  buffer: Buffer,
  filename: string,
  columnAliases: Record<string, string>
): Promise<RawRow[]> {
  const workbook = new ExcelJS.Workbook();
  const isCsv = filename.toLowerCase().endsWith(".csv");

  let worksheet: ExcelJS.Worksheet;
  if (isCsv) {
    worksheet = await workbook.csv.read(Readable.from(buffer));
  } else {
    await workbook.xlsx.load(buffer as unknown as ExcelJS.Buffer);
    const first = workbook.worksheets[0];
    if (!first) {
      throw new Error("The uploaded file has no worksheets");
    }
    worksheet = first;
  }

  const headerRow = worksheet.getRow(1);
  const columnMap = new Map<number, string>();
  headerRow.eachCell((cell, colNumber) => {
    const header = cellText(cell).toLowerCase();
    const field = columnAliases[header];
    if (field) {
      columnMap.set(colNumber, field);
    }
  });

  const rows: RawRow[] = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const raw: Record<string, string> = {};
    let hasAnyValue = false;
    columnMap.forEach((field, colNumber) => {
      const value = cellText(row.getCell(colNumber));
      if (value) hasAnyValue = true;
      raw[field] = value;
    });
    if (hasAnyValue) {
      rows.push({ rowNumber, ...raw } as RawRow);
    }
  });

  return rows;
}

// Groups consecutive rows sharing the same composite key into one candidate
// per key — the CSV convention for nested one-to-many data (a problem's test
// cases, a quiz's sections/questions): parent-level fields repeat on every
// row, and a new key value starts a new group. Rows are NOT re-sorted by key
// first, so two non-consecutive blocks with the same key become two groups —
// that's deliberate: it keeps a single accidental blank/duplicate title from
// silently merging unrelated rows sitting far apart in the file.
export function groupConsecutiveRows<T extends RawRow>(rows: T[], keyOf: (row: T) => string): T[][] {
  const groups: T[][] = [];
  let currentKey: string | null = null;
  let current: T[] = [];
  for (const row of rows) {
    const key = keyOf(row);
    if (key !== currentKey) {
      if (current.length) groups.push(current);
      current = [];
      currentKey = key;
    }
    current.push(row);
  }
  if (current.length) groups.push(current);
  return groups;
}

export function splitList(value: string): string[] {
  return value
    .split(";")
    .map((v) => v.trim())
    .filter(Boolean);
}

export function parseBoolean(value: string): boolean {
  return ["true", "yes", "1", "y"].includes(value.trim().toLowerCase());
}
