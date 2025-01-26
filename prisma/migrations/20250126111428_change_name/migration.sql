/*
  Warnings:

  - You are about to drop the `Grade` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VerificationToken` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "user_email_key";

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "emailVerified" DROP NOT NULL;

-- DropTable
DROP TABLE "Grade";

-- DropTable
DROP TABLE "VerificationToken";

-- CreateTable
CREATE TABLE "grade" (
    "id" TEXT NOT NULL,
    "systemId" TEXT NOT NULL,
    "gradeId" TEXT NOT NULL,
    "teacherName" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL,
    "termId" TEXT NOT NULL,
    "semester" INTEGER NOT NULL,
    "displayName" TEXT NOT NULL,
    "registerNumber" TEXT NOT NULL,
    "classCode" TEXT NOT NULL,
    "className" TEXT NOT NULL,
    "classGrade" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "point" INTEGER NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "grade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "grade_gradeId_key" ON "grade"("gradeId");
