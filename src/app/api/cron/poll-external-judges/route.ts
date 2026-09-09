import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pollExternalJudgeAccountOnce } from "@/lib/externalJudge";

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accounts = await prisma.externalJudgeAccount.findMany({
    where: { platform: "LEETCODE", trackingStatus: "ACTIVE" },
  });

  let polled = 0;
  let newSubmissions = 0;
  let blocked = 0;

  for (const account of accounts) {
    const result = await pollExternalJudgeAccountOnce(account);
    if (result.outcome === "error") {
      // Transient failure (network/rate-limit) — leave status untouched, retry next tick.
      continue;
    }
    polled++;
    if (result.outcome === "blocked") {
      blocked++;
    } else {
      newSubmissions += result.newSubmissions;
    }
  }

  return NextResponse.json({ accountsChecked: accounts.length, polled, newSubmissions, blocked });
}
