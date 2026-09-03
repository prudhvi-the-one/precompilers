import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { fetchLeetCodeAboutMe } from "@/lib/externalJudge";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const platform = body?.platform;
  if (platform !== "LEETCODE" && platform !== "CODECHEF") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const account = await prisma.externalJudgeAccount.findUnique({
    where: { userId_platform: { userId: user.id, platform } },
  });
  if (!account || !account.verificationCode) {
    return NextResponse.json({ error: "Link an account first" }, { status: 400 });
  }

  if (platform !== "LEETCODE") {
    return NextResponse.json({ error: "Only LeetCode verification is supported right now" }, { status: 400 });
  }

  let aboutMe: string | null;
  try {
    aboutMe = await fetchLeetCodeAboutMe(account.handle);
  } catch (err) {
    return NextResponse.json(
      { error: "Couldn't reach LeetCode — try again in a moment", detail: (err as Error).message },
      { status: 503 }
    );
  }

  if (aboutMe === null) {
    return NextResponse.json(
      { error: "LeetCode username not found or profile is private" },
      { status: 400 }
    );
  }
  if (!aboutMe.includes(account.verificationCode)) {
    return NextResponse.json(
      { error: "Verification code not found in your LeetCode bio yet — save your profile and try again" },
      { status: 400 }
    );
  }

  const updated = await prisma.externalJudgeAccount.update({
    where: { id: account.id },
    data: { verifiedAt: new Date(), trackingStatus: "ACTIVE" },
  });

  return NextResponse.json({ account: updated });
}
