/*
  Warnings:

  - You are about to alter the column `grade` on the `Grade` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - Added the required column `classGrade` to the `Grade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `semester` to the `Grade` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Grade" ADD COLUMN     "classGrade" TEXT NOT NULL,
ADD COLUMN     "semester" INTEGER NOT NULL,
ALTER COLUMN "grade" SET DATA TYPE INTEGER;
