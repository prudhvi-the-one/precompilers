import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { requestId } = await params;
  const mockRequest = await prisma.mockRequest.findUnique({
    where: { id: requestId },
  });
  if (!mockRequest || mockRequest.userId !== session.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    paired: Boolean(mockRequest.pairedWithId),
    roomUrl: mockRequest.roomUrl,
  });
}
