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
  const value = Math.round((completed / enrollment.track.lectures.length) * 100);

  return {
    label: "Industry skills",
    value,
    provenance: "SELF-PACED",
    caption: `${completed} of ${enrollment.track.lectures.length} lessons in ${enrollment.track.name}`,
  };
}

export async function computeReadinessPillars(
  userId: string
): Promise<PillarResult[]> {
  const [fundamentals, aptitude, industry] = await Promise.all([
    computeFundamentals(userId),
    computeAptitude(userId),
    computeIndustrySkills(userId),
  ]);

  return [
    fundamentals,
    aptitude,
    { label: "Problem solving", value: null, provenance: null, caption: "Not assessed yet" },
    industry,
    { label: "Projects", value: null, provenance: null, caption: "Not assessed yet" },
    { label: "Interview performance", value: null, provenance: null, caption: "Not assessed yet" },
  ];
}
