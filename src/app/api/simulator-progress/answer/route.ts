import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import {
  SIMULATOR_PROGRESS_CONTENT,
  XP_PER_CORRECT_ANSWER,
  XP_PER_OPERATION_MASTERED,
  GLOBAL_XP_SHARE,
  isMastered,
  rankForXp,
} from "@/lib/simulators/progressConfig";
import type { ArrayOp } from "@/lib/simulators/arrayOpsSteps";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    topicId?: string;
    operation?: string;
    correct?: boolean;
  } | null;
  if (!body?.topicId || !body.operation || typeof body.correct !== "boolean") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const topic = await prisma.topic.findUnique({ where: { id: body.topicId } });
  const content = topic?.simulatorKey ? SIMULATOR_PROGRESS_CONTENT[topic.simulatorKey] : null;
  if (!topic || !content || !content.operations.includes(body.operation as ArrayOp)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const operation = body.operation as ArrayOp;
  const correct = body.correct;

  const result = await prisma.$transaction(async (tx) => {
    const progress = await tx.simulatorProgress.upsert({
      where: { userId_topicId: { userId: user.id, topicId: topic.id } },
      update: {},
      create: { userId: user.id, topicId: topic.id },
      include: { operations: true },
    });

    const wasFirstEverAnswer = progress.operations.reduce((sum, o) => sum + o.attempts, 0) === 0;

    const existingOp = progress.operations.find((o) => o.operation === operation);
    const newAttempts = (existingOp?.attempts ?? 0) + 1;
    const newCorrect = (existingOp?.correct ?? 0) + (correct ? 1 : 0);
    const wasAlreadyMastered = Boolean(existingOp?.masteredAt);
    const justMastered = !wasAlreadyMastered && isMastered(newAttempts, newCorrect);

    await tx.simulatorOperationProgress.upsert({
      where: { progressId_operation: { progressId: progress.id, operation } },
      update: {
        attempts: newAttempts,
        correct: newCorrect,
        ...(justMastered ? { masteredAt: new Date() } : {}),
      },
      create: {
        progressId: progress.id,
        operation,
        attempts: newAttempts,
        correct: newCorrect,
        masteredAt: justMastered ? new Date() : null,
      },
    });

    const newStreak = correct ? progress.currentCorrectStreak + 1 : 0;

    let xpDelta = correct ? XP_PER_CORRECT_ANSWER : 0;
    if (justMastered) xpDelta += XP_PER_OPERATION_MASTERED;

    const completedQuests: string[] = [];
    const patch: Record<string, Date> = {};

    if (!progress.questFirstStepsAt && wasFirstEverAnswer) {
      const quest = content.quests.find((q) => q.key === "firstSteps");
      if (quest) {
        xpDelta += quest.xp;
        completedQuests.push(quest.title);
        patch.questFirstStepsAt = new Date();
      }
    }

    if (!progress.questStreakAt && newStreak >= content.streakTarget) {
      const quest = content.quests.find((q) => q.key === "streak");
      if (quest) {
        xpDelta += quest.xp;
        completedQuests.push(quest.title);
        patch.questStreakAt = new Date();
      }
    }

    // Recompute the full operation map (including this answer) to check the
    // two "every operation" quests without a second round-trip.
    const opMap = new Map(progress.operations.map((o) => [o.operation, o]));
    opMap.set(operation, {
      ...(existingOp ?? { id: "", progressId: progress.id, operation, attempts: 0, correct: 0, masteredAt: null }),
      attempts: newAttempts,
      correct: newCorrect,
      masteredAt: justMastered ? new Date() : (existingOp?.masteredAt ?? null),
    });

    const allAttempted = content.operations.every((op) => (opMap.get(op)?.attempts ?? 0) > 0);
    if (!progress.questAllOperationsAttemptedAt && allAttempted) {
      const quest = content.quests.find((q) => q.key === "allOperationsAttempted");
      if (quest) {
        xpDelta += quest.xp;
        completedQuests.push(quest.title);
        patch.questAllOperationsAttemptedAt = new Date();
      }
    }

    const allMastered = content.operations.every((op) => Boolean(opMap.get(op)?.masteredAt));
    if (!progress.questAllMasteredAt && allMastered) {
      const quest = content.quests.find((q) => q.key === "allMastered");
      if (quest) {
        xpDelta += quest.xp;
        completedQuests.push(quest.title);
        patch.questAllMasteredAt = new Date();
      }
    }

    const globalDelta = Math.floor(xpDelta * GLOBAL_XP_SHARE);
    const prevRank = rankForXp(topic.simulatorKey as string, progress.simulatorXp);

    const updated = await tx.simulatorProgress.update({
      where: { id: progress.id },
      data: {
        simulatorXp: { increment: xpDelta },
        globalXpEarned: { increment: globalDelta },
        currentCorrectStreak: newStreak,
        ...patch,
      },
      include: { operations: true },
    });

    const newRank = rankForXp(topic.simulatorKey as string, updated.simulatorXp);

    return {
      simulatorXp: updated.simulatorXp,
      globalXpEarned: updated.globalXpEarned,
      currentCorrectStreak: updated.currentCorrectStreak,
      operations: Object.fromEntries(
        updated.operations.map((o) => [
          o.operation,
          { attempts: o.attempts, correct: o.correct, mastered: Boolean(o.masteredAt) },
        ])
      ),
      quests: {
        firstSteps: Boolean(updated.questFirstStepsAt),
        allOperationsAttempted: Boolean(updated.questAllOperationsAttemptedAt),
        streak: Boolean(updated.questStreakAt),
        allMastered: Boolean(updated.questAllMasteredAt),
      },
      rank: newRank.name,
      events: {
        xpGained: xpDelta,
        justMasteredOperation: justMastered ? operation : null,
        completedQuests,
        rankedUp: newRank.name !== prevRank.name ? { from: prevRank.name, to: newRank.name } : null,
      },
    };
  }, { timeout: 15000 });

  return NextResponse.json(result);
}
