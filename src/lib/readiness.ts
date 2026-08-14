import { prisma } from "@/lib/prisma";

export type PillarResult = {
  label: string;
  value: number | null;
  provenance: "VERIFIED" | "SELF-PACED" | null;
  caption: string;
};

async function computeFundamentals(userId: string): Promise<PillarResult> {
  const attempts = await prisma.quizAttempt.findMany({
    where: { userId, submittedAt: { not: null }, quiz: { kind: "TOPIC_QUIZ" } },
    orderBy: { submittedAt: "desc" },
  });
  if (attempts.length === 0) {
    return {
      label: "Fundamentals",
      value: null,
      provenance: null,
      caption: "Not assessed yet",
    };
  }

  const latestByQuiz = new Map<string, number>();
  for (const attempt of attempts) {
    if (!latestByQuiz.has(attempt.quizId)) {
      latestByQuiz.set(attempt.quizId, attempt.score ?? 0);
    }
  }
  const scores = [...latestByQuiz.values()];
  const value = Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);

  return {
    label: "Fundamentals",
    value,
    provenance: "SELF-PACED",
    caption: `${scores.length} quiz${scores.length === 1 ? "" : "zes"} taken`,
  };
}

async function computeAptitude(userId: string): Promise<PillarResult> {
  const attempts = await prisma.quizAttempt.findMany({
    where: { userId, submittedAt: { not: null }, quiz: { kind: "APTITUDE_PAPER" } },
  });
  if (attempts.length === 0) {
    return {
      label: "Aptitude & communication",
      value: null,
      provenance: null,
      caption: "Not assessed yet",
    };
  }

  const value = Math.round(
    attempts.reduce((sum, a) => sum + (a.score ?? 0), 0) / attempts.length
  );
  const verified = attempts.some((a) => a.proctored && !a.endedByViolation);

  return {
    label: "Aptitude & communication",
    value,
    provenance: verified ? "VERIFIED" : "SELF-PACED",
    caption: `${attempts.length} paper${attempts.length === 1 ? "" : "s"} attempted`,
  };
}

async function computeIndustrySkills(userId: string): Promise<PillarResult> {
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId },
    include: { track: { include: { lectures: true } } },
  });
  if (!enrollment || enrollment.track.lectures.length === 0) {
    return {
      label: "Industry skills",
      value: null,
      provenance: null,
      caption: "Not assessed yet",
    };
  }

  const completed = await prisma.lectureProgress.count({
    where: {
      userId,
      lectureId: { in: enrollment.track.lectures.map((l) => l.id) },
      completedAt: { not: null },
    },
  });

  if (completed === 0) {
    return {
      label: "Industry skills",
      value: null,
      provenance: null,
      caption: "Not started yet",
    };
  }

  const value = Math.round((completed / enrollment.track.lectures.length) * 100);

  return {
    label: "Industry skills",
    value,
    provenance: "SELF-PACED",
    caption: `${completed} of ${enrollment.track.lectures.length} lessons in ${enrollment.track.name}`,
  };
}

async function computeProjects(userId: string): Promise<PillarResult> {
  const submissions = await prisma.projectSubmission.findMany({
    where: { userId },
    include: { reviews: true },
  });
  const allReviews = submissions.flatMap((s) => s.reviews);
  if (submissions.length === 0) {
    return {
      label: "Projects",
      value: null,
      provenance: null,
      caption: "Not assessed yet",
    };
  }
  if (allReviews.length === 0) {
    return {
      label: "Projects",
      value: null,
      provenance: "SELF-PACED",
      caption: `${submissions.length} submitted, awaiting review`,
    };
  }

  const perReviewAvg = allReviews.map(
    (r) => (r.correctness + r.efficiency + r.readability) / 3
  );
  const value = Math.round(
    (perReviewAvg.reduce((sum, v) => sum + v, 0) / perReviewAvg.length) * 20
  );

  return {
    label: "Projects",
    value,
    provenance: "VERIFIED",
    caption: `${submissions.length} shipped, ${allReviews.length} reviewed`,
  };
}

async function computeInterviewPerformance(userId: string): Promise<PillarResult> {
  const [mockFeedback, gdRatings, mentorScorecards] = await Promise.all([
    prisma.mockFeedback.findMany({ where: { rateeId: userId } }),
    prisma.gdRating.findMany({ where: { rateeId: userId } }),
    prisma.mentorScorecard.findMany({
      where: { session: { studentId: userId } },
    }),
  ]);

  const scores: number[] = [
    ...mockFeedback.map((f) => f.score * 20),
    ...gdRatings.map((r) => ((r.clarity + r.content + r.courtesy) / 3) * 20),
    ...mentorScorecards.map(
      (s) => ((s.technical + s.communication + s.problemSolving + s.confidence) / 4) * 20
    ),
  ];

  if (scores.length === 0) {
    return {
      label: "Interview performance",
      value: null,
      provenance: null,
      caption: "Not assessed yet",
    };
  }

  const value = Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
  const parts: string[] = [];
  if (mockFeedback.length > 0) {
    parts.push(`${mockFeedback.length} mock${mockFeedback.length === 1 ? "" : "s"}`);
  }
  if (gdRatings.length > 0) {
    parts.push(`${gdRatings.length} GD rating${gdRatings.length === 1 ? "" : "s"}`);
  }
  if (mentorScorecards.length > 0) {
    parts.push(
      `${mentorScorecards.length} mentor scorecard${mentorScorecards.length === 1 ? "" : "s"}`
    );
  }

  return {
    label: "Interview performance",
    value,
    provenance: mentorScorecards.length > 0 ? "VERIFIED" : "SELF-PACED",
    caption: parts.join(", "),
  };
}

async function computeProblemSolving(userId: string): Promise<PillarResult> {
  const [totalProblems, submissions] = await Promise.all([
    prisma.problem.count(),
    prisma.submission.findMany({ where: { userId } }),
  ]);

  if (submissions.length === 0 || totalProblems === 0) {
    return {
      label: "Problem solving",
      value: null,
      provenance: null,
      caption: "Not assessed yet",
    };
  }

  const solvedCount = new Set(
    submissions.filter((s) => s.verdict === "ACCEPTED").map((s) => s.problemId)
  ).size;
  const value = Math.round((solvedCount / totalProblems) * 100);

  return {
    label: "Problem solving",
    value,
    provenance: "SELF-PACED",
    caption: `${solvedCount} of ${totalProblems} problems solved`,
  };
}

export async function computeReadinessPillars(
  userId: string
): Promise<PillarResult[]> {
  const [fundamentals, aptitude, problemSolving, industry, projects, interview] =
    await Promise.all([
      computeFundamentals(userId),
      computeAptitude(userId),
      computeProblemSolving(userId),
      computeIndustrySkills(userId),
      computeProjects(userId),
      computeInterviewPerformance(userId),
    ]);

  return [fundamentals, aptitude, problemSolving, industry, projects, interview];
}

export async function computeOverallReadiness(userId: string): Promise<number | null> {
  const pillars = await computeReadinessPillars(userId);
  const scored = pillars.filter((p) => p.value !== null);
  if (scored.length === 0) {
    return null;
  }
  return Math.round(scored.reduce((sum, p) => sum + (p.value as number), 0) / scored.length);
}
