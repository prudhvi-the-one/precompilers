import { Readable } from "stream";
import ExcelJS from "exceljs";

export type RosterRawRow = {
  rowNumber: number;
  name: string;
  email: string;
  branch: string;
  rollNumber: string;
  phoneNumber: string;
};

const COLUMN_ALIASES: Record<string, keyof Omit<RosterRawRow, "rowNumber">> = {
  name: "name",
  "full name": "name",
  "student name": "name",
  email: "email",
  "email address": "email",
  branch: "branch",
  department: "branch",
  "roll number": "rollNumber",
  "roll no": "rollNumber",
  rollnumber: "rollNumber",
  rollno: "rollNumber",
  phone: "phoneNumber",
  "phone number": "phoneNumber",
  mobile: "phoneNumber",
  "mobile number": "phoneNumber",
};

function cellText(cell: ExcelJS.Cell | undefined): string {
  if (!cell || cell.value === null || cell.value === undefined) return "";
  return String(cell.value).trim();
}

// Reads an uploaded roster (.xlsx or .csv) into raw rows keyed by field name,
// matching columns by header text rather than fixed position — real vendor
// spreadsheets won't agree on column order. Values are returned untrimmed of
// meaning but not yet validated; that happens in the route.
export async function parseRosterFile(
  buffer: Buffer,
  filename: string
): Promise<RosterRawRow[]> {
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
  const columnMap = new Map<number, keyof Omit<RosterRawRow, "rowNumber">>();
  headerRow.eachCell((cell, colNumber) => {
    const header = cellText(cell).toLowerCase();
    const field = COLUMN_ALIASES[header];
    if (field) {
      columnMap.set(colNumber, field);
    }
  });

  const rows: RosterRawRow[] = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const raw: Omit<RosterRawRow, "rowNumber"> = {
      name: "",
      email: "",
      branch: "",
      rollNumber: "",
      phoneNumber: "",
    };
    let hasAnyValue = false;
    columnMap.forEach((field, colNumber) => {
      const value = cellText(row.getCell(colNumber));
      if (value) hasAnyValue = true;
      raw[field] = value;
    });
    if (hasAnyValue) {
      rows.push({ rowNumber, ...raw });
    }
  });

  return rows;
}
