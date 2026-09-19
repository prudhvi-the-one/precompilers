-- CreateTable
CREATE TABLE "SimulatorProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "simulatorXp" INTEGER NOT NULL DEFAULT 0,
    "globalXpEarned" INTEGER NOT NULL DEFAULT 0,
    "currentCorrectStreak" INTEGER NOT NULL DEFAULT 0,
    "questFirstStepsAt" TIMESTAMP(3),
    "questAllOperationsAttemptedAt" TIMESTAMP(3),
    "questStreakAt" TIMESTAMP(3),
    "questAllMasteredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SimulatorProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SimulatorOperationProgress" (
    "id" TEXT NOT NULL,
    "progressId" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "correct" INTEGER NOT NULL DEFAULT 0,
    "masteredAt" TIMESTAMP(3),

    CONSTRAINT "SimulatorOperationProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SimulatorProgress_userId_topicId_key" ON "SimulatorProgress"("userId", "topicId");

-- CreateIndex
CREATE UNIQUE INDEX "SimulatorOperationProgress_progressId_operation_key" ON "SimulatorOperationProgress"("progressId", "operation");

-- AddForeignKey
ALTER TABLE "SimulatorProgress" ADD CONSTRAINT "SimulatorProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimulatorProgress" ADD CONSTRAINT "SimulatorProgress_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimulatorOperationProgress" ADD CONSTRAINT "SimulatorOperationProgress_progressId_fkey" FOREIGN KEY ("progressId") REFERENCES "SimulatorProgress"("id") ON DELETE CASCADE ON UPDATE CASCADE;
