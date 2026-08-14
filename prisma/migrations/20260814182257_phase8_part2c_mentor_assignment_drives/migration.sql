-- CreateTable
CREATE TABLE "InstitutionPreferredMentor" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "mentorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InstitutionPreferredMentor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Drive" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "roleTitle" TEXT NOT NULL,
    "driveDate" TIMESTAMP(3) NOT NULL,
    "applyDeadline" TIMESTAMP(3),
    "applyUrl" TEXT,
    "location" TEXT,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Drive_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InstitutionPreferredMentor_institutionId_mentorId_key" ON "InstitutionPreferredMentor"("institutionId", "mentorId");

-- AddForeignKey
ALTER TABLE "InstitutionPreferredMentor" ADD CONSTRAINT "InstitutionPreferredMentor_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstitutionPreferredMentor" ADD CONSTRAINT "InstitutionPreferredMentor_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "MentorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
