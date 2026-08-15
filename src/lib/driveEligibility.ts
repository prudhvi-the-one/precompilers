import type { Drive, User } from "@prisma/client";

export type FailedCriterion = {
  label: string;
  required: string;
  actual: string;
};

export type EligibilityResult = {
  eligible: boolean;
  failedCriteria: FailedCriterion[];
};

export function evaluateEligibility(
  user: Pick<User, "cgpa" | "backlogCount" | "branch">,
  drive: Pick<Drive, "minCgpa" | "maxBacklogs" | "eligibleBranches">
): EligibilityResult {
  const failedCriteria: FailedCriterion[] = [];

  if (drive.minCgpa !== null) {
    const actual = user.cgpa;
    if (actual === null || actual < drive.minCgpa) {
      failedCriteria.push({
        label: "CGPA",
        required: `≥ ${drive.minCgpa}`,
        actual: actual !== null ? String(actual) : "not set",
      });
    }
  }

  if (drive.maxBacklogs !== null) {
    const actual = user.backlogCount;
    if (actual === null || actual > drive.maxBacklogs) {
      failedCriteria.push({
        label: "Backlogs",
        required: `≤ ${drive.maxBacklogs}`,
        actual: actual !== null ? String(actual) : "not set",
      });
    }
  }

  if (drive.eligibleBranches.length > 0) {
    const actual = user.branch;
    if (!actual || !drive.eligibleBranches.includes(actual)) {
      failedCriteria.push({
        label: "Branch",
        required: drive.eligibleBranches.join("/"),
        actual: actual ?? "not set",
      });
    }
  }

  return { eligible: failedCriteria.length === 0, failedCriteria };
}
