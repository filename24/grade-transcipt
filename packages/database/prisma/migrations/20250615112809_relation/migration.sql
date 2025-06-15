/*
  Warnings:

  - The values [GrandIT] on the enum `UserType` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[systemId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('APPROVED', 'PENDING', 'REJECTED', 'NEW');

-- AlterEnum
BEGIN;
CREATE TYPE "UserType_new" AS ENUM ('Medle', 'ESIS');
ALTER TABLE "User" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "type" TYPE "UserType_new" USING ("type"::text::"UserType_new");
ALTER TYPE "UserType" RENAME TO "UserType_old";
ALTER TYPE "UserType_new" RENAME TO "UserType";
DROP TYPE "UserType_old";
ALTER TABLE "User" ALTER COLUMN "type" SET DEFAULT 'ESIS';
COMMIT;

-- AlterTable
ALTER TABLE "Exam" ALTER COLUMN "point" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Grade" ALTER COLUMN "point" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT,
ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "classId" DROP DEFAULT,
ALTER COLUMN "schoolId" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "Exam_systemId_idx" ON "Exam"("systemId");

-- CreateIndex
CREATE INDEX "Grade_classCode_systemId_idx" ON "Grade"("classCode", "systemId");

-- CreateIndex
CREATE UNIQUE INDEX "User_systemId_key" ON "User"("systemId");

-- CreateIndex
CREATE INDEX "User_registerNumber_systemId_idx" ON "User"("registerNumber", "systemId");

-- AddForeignKey
ALTER TABLE "Grade" ADD CONSTRAINT "Grade_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "User"("systemId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "User"("systemId") ON DELETE RESTRICT ON UPDATE CASCADE;
