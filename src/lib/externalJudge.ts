import { prisma } from "@/lib/prisma";
import type { ExternalJudgeAccount } from "@prisma/client";

const LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql";

async function leetcodeQuery<T>(
  query: string,
  variables: Record<string, unknown>
): Promise<T> {
  const res = await fetch(LEETCODE_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Referer: "https://leetcode.com",
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    throw new Error(`LeetCode request failed: ${res.status}`);
  }
  const json = await res.json();
  return json.data as T;
}

export async function fetchLeetCodeAboutMe(username: string): Promise<string | null> {
  const data = await leetcodeQuery<{
    matchedUser: { profile: { aboutMe: string } } | null;
  }>(
    `query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        profile { aboutMe }
      }
    }`,
    { username }
  );
  return data.matchedUser?.profile.aboutMe ?? null;
}

export type LeetCodeAcSubmission = {
  id: string;
  title: string;
  titleSlug: string;
  timestamp: string;
};

// Returns null when LeetCode's own response omits the list entirely — the
// best available signal that the account has hidden its submission history,
// as distinct from a genuinely empty (but public) recent-activity list.
// This is a best-effort heuristic, not a documented API contract.
export async function fetchLeetCodeRecentAcSubmissions(
  username: string,
  limit = 20
): Promise<LeetCodeAcSubmission[] | null> {
  const data = await leetcodeQuery<{
    recentAcSubmissionList: LeetCodeAcSubmission[] | null;
  }>(
    `query recentAcSubmissions($username: String!, $limit: Int!) {
      recentAcSubmissionList(username: $username, limit: $limit) {
        id title titleSlug timestamp
      }
    }`,
    { username, limit }
  );
  return data.recentAcSubmissionList;
}

export type LeetCodeQuestion = {
  title: string;
  titleSlug: string;
  difficulty: string;
};

export type PollAccountResult =
  | { outcome: "polled"; newSubmissions: number }
  | { outcome: "blocked" }
  | { outcome: "error" };

// Single source of truth for polling one account, called from both the scheduled
// cron and the manual "retry tracking" admin/vendor-admin action — one implementation,
// not two, so both paths ingest/flag results identically.
export async function pollExternalJudgeAccountOnce(
  account: ExternalJudgeAccount
): Promise<PollAccountResult> {
  let submissions: LeetCodeAcSubmission[] | null;
  try {
    submissions = await fetchLeetCodeRecentAcSubmissions(account.handle, 20);
  } catch {
    return { outcome: "error" };
  }

  if (submissions === null) {
    await prisma.externalJudgeAccount.update({
      where: { id: account.id },
      data: { trackingStatus: "BLOCKED_OR_PRIVATE", lastPolledAt: new Date() },
    });
    return { outcome: "blocked" };
  }

  let newSubmissions = 0;
  for (const submission of submissions) {
    const submittedAt = new Date(Number(submission.timestamp) * 1000);
    const created = await prisma.externalSubmissionRecord.upsert({
      where: {
        externalJudgeAccountId_problemSlug_submittedAt: {
          externalJudgeAccountId: account.id,
          problemSlug: submission.titleSlug,
          submittedAt,
        },
      },
      update: {},
      create: {
        externalJudgeAccountId: account.id,
        problemSlug: submission.titleSlug,
        problemTitle: submission.title,
        submittedAt,
      },
    });
    if (created.firstSeenAt.getTime() > Date.now() - 1000) {
      newSubmissions++;
    }
  }

  await prisma.externalJudgeAccount.update({
    where: { id: account.id },
    data: { trackingStatus: "ACTIVE", lastPolledAt: new Date(), lastSuccessfulPollAt: new Date() },
  });

  return { outcome: "polled", newSubmissions };
}

export async function fetchLeetCodeQuestion(
  titleSlug: string
): Promise<LeetCodeQuestion | null> {
  const data = await leetcodeQuery<{ question: LeetCodeQuestion | null }>(
    `query questionTitle($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        title titleSlug difficulty
      }
    }`,
    { titleSlug }
  );
  return data.question;
}
