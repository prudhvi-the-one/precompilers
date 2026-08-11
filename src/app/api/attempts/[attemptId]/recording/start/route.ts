import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { r2, R2_BUCKET } from "@/lib/r2";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { attemptId } = await params;
  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: attemptId },
  });
  if (!attempt || attempt.userId !== session.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!attempt.proctored) {
    return NextResponse.json(
      { error: "Only proctored attempts record" },
      { status: 400 }
    );
  }

  const key = `recordings/${attemptId}.webm`;
  const uploadUrl = await getSignedUrl(
    r2,
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      ContentType: "video/webm",
    }),
    { expiresIn: 600 }
  );

  return NextResponse.json({ uploadUrl, key });
}
