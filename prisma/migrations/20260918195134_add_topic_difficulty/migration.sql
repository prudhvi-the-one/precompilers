-- CreateEnum
CREATE TYPE "TopicDifficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- AlterTable
ALTER TABLE "Topic" ADD COLUMN     "difficulty" "TopicDifficulty" NOT NULL DEFAULT 'INTERMEDIATE';
