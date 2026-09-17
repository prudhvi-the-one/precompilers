import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { topicAuthorSchema } from "@/lib/validation";
import { uniqueSlug } from "@/lib/slugify";
import { parseSpreadsheet } from "@/lib/bulkContentUpload";

export const maxDuration = 300;

const COLUMN_ALIASES: Record<string, string> = {
  name: "name",
  description: "description",
  unitlabel: "unitLabel",
  "unit label": "unitLabel",
  order: "order",
  xpreward: "xpReward",
  "xp reward": "xpReward",
  linkedquizid: "linkedQuizId",
  "linked quiz id": "linkedQuizId",
  simulatorkey: "simulatorKey",
  "simulator key": "simulatorKey",
};

type RowResult = { row: number; identifier: string; reason: string };

export async function POST(request: Request) {
  const admin = await requireRole(["ADMIN", "SUPER_ADMIN"]);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  const subjectId = formData?.get("subjectId");
  if (!subjectId || typeof subjectId !== "string") {
    return NextResponse.json({ error: "subjectId is required" }, { status: 400 });
  }
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
  if (!subject) {
    return NextResponse.json({ error: "Subject not found" }, { status: 404 });
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

  const existingTopics = await prisma.topic.findMany({
    where: { subjectId },
    select: { order: true },
  });
  const usedOrders = new Set(existingTopics.map((t) => t.order));
  let autoCursor = 0;
  function nextAutoOrder(): number {
    while (usedOrders.has(autoCursor)) autoCursor++;
    usedOrders.add(autoCursor);
    return autoCursor++;
  }

  const invalid: RowResult[] = [];
  const skipped: RowResult[] = [];
  let createdCount = 0;
  const assignedSlugs = new Set<string>();

  for (const raw of rows) {
    const name = raw.name ?? "";
    const identifier = name || "(no name)";

    let orderValue: number;
    const rawOrder = (raw.order ?? "").trim();
    if (rawOrder) {
      const parsedOrder = Number.parseInt(rawOrder, 10);
      if (!Number.isInteger(parsedOrder) || parsedOrder < 0) {
        invalid.push({ row: raw.rowNumber, identifier, reason: "Invalid order (must be a non-negative integer)" });
        continue;
      }
      if (usedOrders.has(parsedOrder)) {
        skipped.push({ row: raw.rowNumber, identifier, reason: `Order ${parsedOrder} is already used in this subject` });
        continue;
      }
      usedOrders.add(parsedOrder);
      orderValue = parsedOrder;
    } else {
      orderValue = nextAutoOrder();
    }

    const rawXpReward = (raw.xpReward ?? "").trim();
    const xpReward = rawXpReward ? Number.parseInt(rawXpReward, 10) : 100;

    const parsed = topicAuthorSchema.safeParse({
      subjectId,
      name,
      description: raw.description ?? "",
      unitLabel: raw.unitLabel?.trim() || undefined,
      order: orderValue,
      xpReward,
      linkedQuizId: raw.linkedQuizId?.trim() || null,
      simulatorKey: raw.simulatorKey?.trim() || null,
      submit: true,
    });
    if (!parsed.success) {
      invalid.push({ row: raw.rowNumber, identifier, reason: parsed.error.issues[0]?.message ?? "Invalid row" });
      continue;
    }

    const { submit, ...scalars } = parsed.data;
    void submit;

    const slug = await uniqueSlug(scalars.name, async (candidate) => {
      if (assignedSlugs.has(candidate)) return true;
      return Boolean(await prisma.topic.findUnique({ where: { slug: candidate } }));
    });
    assignedSlugs.add(slug);

    try {
      await prisma.topic.create({
        data: {
          ...scalars,
          unitLabel: scalars.unitLabel || null,
          linkedQuizId: scalars.linkedQuizId || null,
          simulatorKey: scalars.simulatorKey || null,
          slug,
          status: "PUBLISHED",
        },
      });
      createdCount++;
    } catch (err) {
      invalid.push({ row: raw.rowNumber, identifier, reason: `Couldn't create: ${(err as Error).message}` });
    }
  }

  return NextResponse.json({ created: createdCount, skipped, invalid });
}
