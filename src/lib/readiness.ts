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

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

export async function computeReadinessDelta(userId: string): Promise<number | null> {
  const cutoff = new Date(Date.now() - NINETY_DAYS_MS);
  const [current, snapshot] = await Promise.all([
    computeOverallReadiness(userId),
    prisma.readinessSnapshot.findFirst({
      where: { userId, capturedAt: { lte: cutoff } },
      orderBy: { capturedAt: "desc" },
    }),
  ]);
  if (current === null || !snapshot || snapshot.overallScore === null) {
    return null;
  }
  return current - snapshot.overallScore;
}

export type ActivityCounts = {
  lessonsCompleted: number;
  problemsSolved: number;
  mocksCompleted: number;
};

export async function computeActivityCounts(userId: string): Promise<ActivityCounts> {
  const [lessonsCompleted, acceptedSubmissions, mockFeedbackCount, mentorScorecardCount] =
    await Promise.all([
      prisma.lectureProgress.count({ where: { userId, completedAt: { not: null } } }),
      prisma.submission.findMany({
        where: { userId, verdict: "ACCEPTED" },
        select: { problemId: true },
      }),
      prisma.mockFeedback.count({ where: { rateeId: userId } }),
      prisma.mentorScorecard.count({
        where: { session: { studentId: userId, kind: { in: ["MOCK", "HR_ROUND"] } } },
      }),
    ]);

  return {
    lessonsCompleted,
    problemsSolved: new Set(acceptedSubmissions.map((s) => s.problemId)).size,
    mocksCompleted: mockFeedbackCount + mentorScorecardCount,
  };
}

export function summarizeReadiness(pillars: PillarResult[]): string | null {
  const scored = pillars.filter(
    (p): p is PillarResult & { value: number } => p.value !== null
  );
  if (scored.length === 0) {
    return null;
  }
  const strongest = scored.reduce((a, b) => (b.value > a.value ? b : a));
  const weakest = scored.reduce((a, b) => (b.value < a.value ? b : a));
  if (strongest.label === weakest.label) {
    return `${strongest.label} is your only assessed pillar so far, at ${strongest.value}.`;
  }
  return `${strongest.label} is interview-ready at ${strongest.value}. ${weakest.label} at ${weakest.value} is what's standing between you and an offer.`;
}

export type ReadinessRecommendation = {
  action: string;
  pointDelta: number;
  timeEstimate: string;
};

const RECOMMENDATION_COPY: Record<string, string> = {
  Fundamentals: "Take two more topic quizzes to firm up fundamentals",
  "Aptitude & communication": "Attempt a full aptitude paper, focused on your weakest section",
  "Problem solving": "Solve more problems tagged with your target companies",
  "Industry skills": "Finish the remaining lectures in your track",
  Projects: "Ship and submit a project brief for peer review",
  "Interview performance": "Book a mock interview or join a group discussion",
};

const RECOMMENDATION_TIME: Record<string, string> = {
  Fundamentals: "1-2 weeks",
  "Aptitude & communication": "1 week",
  "Problem solving": "2-3 weeks",
  "Industry skills": "2-3 weeks",
  Projects: "2 weeks",
  "Interview performance": "ongoing",
};

const WEAK_PILLAR_THRESHOLD = 60;

export type DriveRoundBreakdown = {
  label: string;
  value: number | null;
  gapText: string | null;
};

export type DriveReadinessResult = {
  overall: number | null;
  hiringBarScore: number | null;
  rounds: DriveRoundBreakdown[];
  instruction: string | null;
};

export function computeDriveReadiness(
  pillars: PillarResult[],
  hiringBarScore: number | null
): DriveReadinessResult {
  const byLabel = new Map(pillars.map((p) => [p.label, p.value]));
  const fundamentals = byLabel.get("Fundamentals");
  const problemSolving = byLabel.get("Problem solving");
  const technicalValues = [fundamentals, problemSolving].filter(
    (v): v is number => v !== null && v !== undefined
  );
  const technical =
    technicalValues.length > 0
      ? Math.round(technicalValues.reduce((sum, v) => sum + v, 0) / technicalValues.length)
      : null;

  const rounds: DriveRoundBreakdown[] = [
    {
      label: "Aptitude round",
      value: byLabel.get("Aptitude & communication") ?? null,
      gapText: null,
    },
    { label: "Technical", value: technical, gapText: null },
    {
      label: "HR round",
      value: byLabel.get("Interview performance") ?? null,
      gapText: null,
    },
  ];

  if (hiringBarScore !== null) {
    for (const round of rounds) {
      round.gapText =
        round.value === null
          ? "not assessed"
          : round.value < hiringBarScore
            ? `${round.value}, this is the gap`
            : String(round.value);
    }
  }

  const overall =
    rounds.filter((r) => r.value !== null).length > 0
      ? Math.round(
          rounds.reduce((sum, r) => sum + (r.value ?? 0), 0) /
            rounds.filter((r) => r.value !== null).length
        )
      : null;

  let instruction: string | null = null;
  if (hiringBarScore !== null) {
    const scoredGaps = rounds.filter((r) => r.value !== null && r.value < hiringBarScore);
    if (scoredGaps.length > 0) {
      const weakest = scoredGaps.reduce((a, b) => ((a.value ?? 0) < (b.value ?? 0) ? a : b));
      instruction = `Focus on ${weakest.label.toLowerCase()} — it's what's standing between you and this bar.`;
    }
  }

  return { overall, hiringBarScore, rounds, instruction };
}

export function computeReadinessRecommendations(
  pillars: PillarResult[]
): ReadinessRecommendation[] {
  const recommendations: ReadinessRecommendation[] = [];

  for (const pillar of pillars) {
    if (pillar.value !== null && pillar.value >= WEAK_PILLAR_THRESHOLD) {
      continue;
    }
    const gap = WEAK_PILLAR_THRESHOLD - (pillar.value ?? 0);
    const action = RECOMMENDATION_COPY[pillar.label];
    const timeEstimate = RECOMMENDATION_TIME[pillar.label];
    if (!action || !timeEstimate) {
      continue;
    }
    recommendations.push({
      action,
      pointDelta: Math.max(4, Math.round(gap * 0.3)),
      timeEstimate,
    });
  }

  return recommendations.sort((a, b) => b.pointDelta - a.pointDelta).slice(0, 3);
}
