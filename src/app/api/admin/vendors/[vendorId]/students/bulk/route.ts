import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { hashPassword } from "@/lib/password";
import { createOtpBatch } from "@/lib/otp";
import { sendPasswordResetEmailBatch } from "@/lib/email";
import { parseRosterFile } from "@/lib/rosterUpload";
import { email as emailSchema, phoneNumber as phoneNumberSchema } from "@/lib/validation";
import crypto from "crypto";

export const maxDuration = 300;

type RowResult = { row: number; email: string; reason: string };

export async function POST(
  request: Request,
  { params }: { params: Promise<{ vendorId: string }> }
) {
  const actor = await requireRole(["SUPER_ADMIN", "ADMIN"]);
  if (!actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { vendorId } = await params;
  const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
  if (!vendor) {
    return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  let rawRows;
  try {
    rawRows = await parseRosterFile(buffer, file.name);
  } catch (err) {
    return NextResponse.json(
      { error: `Couldn't read that file: ${(err as Error).message}` },
      { status: 400 }
    );
  }
  if (rawRows.length === 0) {
    return NextResponse.json({ error: "No data rows found in the file" }, { status: 400 });
  }

  const invalid: RowResult[] = [];
  const skipped: RowResult[] = [];
  const candidates: {
    rowNumber: number;
    name: string;
    email: string;
    branch: string;
    rollNumber: string;
    phoneNumber: string | null;
  }[] = [];

  const seenEmails = new Set<string>();
  const seenRollNumbers = new Set<string>();

  for (const raw of rawRows) {
    if (!raw.name) {
      invalid.push({ row: raw.rowNumber, email: raw.email, reason: "Missing name" });
      continue;
    }
    const emailParsed = emailSchema.safeParse(raw.email);
    if (!emailParsed.success) {
      invalid.push({ row: raw.rowNumber, email: raw.email, reason: "Missing or invalid email" });
      continue;
    }
    if (!raw.rollNumber) {
      invalid.push({ row: raw.rowNumber, email: raw.email, reason: "Missing roll number" });
      continue;
    }
    let phoneNumber: string | null = null;
    if (raw.phoneNumber) {
      const phoneParsed = phoneNumberSchema.safeParse(raw.phoneNumber);
      if (!phoneParsed.success) {
        invalid.push({ row: raw.rowNumber, email: raw.email, reason: "Invalid phone number" });
        continue;
      }
      phoneNumber = phoneParsed.data;
    }

    const normalizedEmail = emailParsed.data;
    if (seenEmails.has(normalizedEmail)) {
      skipped.push({ row: raw.rowNumber, email: raw.email, reason: "Duplicate email within this file" });
      continue;
    }
    if (seenRollNumbers.has(raw.rollNumber)) {
      skipped.push({ row: raw.rowNumber, email: raw.email, reason: "Duplicate roll number within this file" });
      continue;
    }

    seenEmails.add(normalizedEmail);
    seenRollNumbers.add(raw.rollNumber);
    candidates.push({
      rowNumber: raw.rowNumber,
      name: raw.name,
      email: normalizedEmail,
      branch: raw.branch,
      rollNumber: raw.rollNumber,
      phoneNumber,
    });
  }

  const [existingByEmail, existingByRollNumber] = await Promise.all([
    candidates.length
      ? prisma.user.findMany({
          where: { email: { in: candidates.map((c) => c.email) } },
          select: { email: true },
        })
      : Promise.resolve([]),
    candidates.length
      ? prisma.user.findMany({
          where: { vendorId, rollNumber: { in: candidates.map((c) => c.rollNumber) } },
          select: { rollNumber: true },
        })
      : Promise.resolve([]),
  ]);
  const existingEmailSet = new Set(existingByEmail.map((u) => u.email));
  const existingRollNumberSet = new Set(existingByRollNumber.map((u) => u.rollNumber));

  const toCreate = candidates.filter((c) => {
    if (existingEmailSet.has(c.email)) {
      skipped.push({ row: c.rowNumber, email: c.email, reason: "An account with that email already exists" });
      return false;
    }
    if (existingRollNumberSet.has(c.rollNumber)) {
      skipped.push({
        row: c.rowNumber,
        email: c.email,
        reason: "A student with that roll number already exists for this vendor",
      });
      return false;
    }
    return true;
  });

  let createdCount = 0;
  if (toCreate.length > 0) {
    const passwordHashes = await Promise.all(
      toCreate.map(() => hashPassword(crypto.randomBytes(32).toString("hex")))
    );

    const created = await prisma.user.createManyAndReturn({
      data: toCreate.map((row, i) => ({
        email: row.email,
        name: row.name,
        role: "STUDENT" as const,
        passwordHash: passwordHashes[i],
        emailVerifiedAt: new Date(),
        vendorId,
        rollNumber: row.rollNumber,
        branch: row.branch || null,
        phoneNumber: row.phoneNumber,
      })),
      select: { id: true, email: true },
    });
    createdCount = created.length;

    const codes = await createOtpBatch(
      created.map((u) => u.id),
      "PASSWORD_RESET"
    );
    const codeByUserId = new Map(codes.map((c) => [c.userId, c.code]));
    const recipients = created
      .map((u) => ({ to: u.email, code: codeByUserId.get(u.id) }))
      .filter((r): r is { to: string; code: string } => Boolean(r.code));

    try {
      await sendPasswordResetEmailBatch(recipients);
    } catch (err) {
      // Accounts are already created — a batch-email failure shouldn't be
      // reported as if nothing happened. Surface it distinctly so the admin
      // knows to resend rather than re-run the whole upload.
      return NextResponse.json({
        created: createdCount,
        skipped,
        invalid,
        emailWarning: `Accounts were created, but sending setup emails failed: ${(err as Error).message}`,
      });
    }
  }

  return NextResponse.json({ created: createdCount, skipped, invalid });
}
