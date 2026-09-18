import { prisma } from "@/lib/prisma";
import type { Topic } from "@prisma/client";

export async function isTopicUnlocked(userId: string, topic: Pick<Topic, "subjectId" | "order">): Promise<boolean> {
  if (topic.order === 0) return true;
  const previous = await prisma.topic.findUnique({
    where: { subjectId_order: { subjectId: topic.subjectId, order: topic.order - 1 } },
  });
  if (!previous) return true;
  const prevProgress = await prisma.topicProgress.findUnique({
    where: { userId_topicId: { userId, topicId: previous.id } },
  });
  return Boolean(prevProgress?.completedAt);
}

export const TOPIC_QUIZ_PASS_THRESHOLD = 90;

// A topic is "completed" only once its linked quiz has been passed at
// PASS_THRESHOLD% or better on some attempt — a student can retake it as many
// times as needed (StartQuizButton already labels a retry "Retake" once any
// attempt exists). Detected lazily on read rather than hooking into the
// shared quiz-submission route, and persisted only once observed true — the
// same "compute live, freeze on first true" convention already used for
// vendor billing/certificates.
async function ensureTopicProgressSynced(userId: string, topic: Topic): Promise<void> {
  if (!topic.linkedQuizId) return;
  const existing = await prisma.topicProgress.findUnique({
    where: { userId_topicId: { userId, topicId: topic.id } },
  });
  if (existing?.completedAt) return;

  const passedAttempt = await prisma.quizAttempt.findFirst({
    where: {
      userId,
      quizId: topic.linkedQuizId,
      submittedAt: { not: null },
      score: { gte: TOPIC_QUIZ_PASS_THRESHOLD },
    },
  });
  if (!passedAttempt) return;

  await prisma.topicProgress.upsert({
    where: { userId_topicId: { userId, topicId: topic.id } },
    update: { completedAt: new Date(), xpEarned: topic.xpReward },
    create: { userId, topicId: topic.id, completedAt: new Date(), xpEarned: topic.xpReward },
  });
}

// Marks a topic "opened" the first time an unlocked student visits it with no
// existing progress row — distinguishes "next up, untouched" from "in progress".
export async function markTopicStarted(userId: string, topicId: string): Promise<void> {
  const existing = await prisma.topicProgress.findUnique({ where: { userId_topicId: { userId, topicId } } });
  if (existing) return;
  await prisma.topicProgress.create({ data: { userId, topicId, startedAt: new Date() } });
}

export type TopicState = "locked" | "unlocked" | "in_progress" | "mastered";

export type PathTopic = Topic & { state: TopicState };

export async function computeSubjectPath(userId: string, subjectId: string): Promise<PathTopic[]> {
  const topics = await prisma.topic.findMany({
    where: { subjectId, status: "PUBLISHED" },
    orderBy: { order: "asc" },
  });

  const result: PathTopic[] = [];
  for (const topic of topics) {
    await ensureTopicProgressSynced(userId, topic);
    const progress = await prisma.topicProgress.findUnique({
      where: { userId_topicId: { userId, topicId: topic.id } },
    });

    let state: TopicState;
    if (progress?.completedAt) {
      state = "mastered";
    } else {
      const unlocked = await isTopicUnlocked(userId, topic);
      if (!unlocked) state = "locked";
      else if (progress?.startedAt) state = "in_progress";
      else state = "unlocked";
    }
    result.push({ ...topic, state });
  }
  return result;
}

export async function computeTotalXp(userId: string): Promise<number> {
  const rows = await prisma.topicProgress.findMany({
    where: { userId, completedAt: { not: null } },
    select: { xpEarned: true },
  });
  return rows.reduce((sum, r) => sum + r.xpEarned, 0);
}

export function levelForXp(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}
