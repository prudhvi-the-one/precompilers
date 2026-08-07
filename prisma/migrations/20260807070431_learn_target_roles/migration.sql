/*
  Warnings:

  - You are about to drop the column `roleDescription` on the `Track` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "TargetRole" AS ENUM ('SOFTWARE_ENGINEER', 'DATA_ML_ENGINEER', 'FRONTEND_ENGINEER', 'CLOUD_DEVOPS', 'HIGHER_STUDIES', 'NOT_SURE');

-- AlterTable
ALTER TABLE "Track" DROP COLUMN "roleDescription",
ADD COLUMN     "relevantRoles" "TargetRole"[];

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "targetRole" "TargetRole";
