/*
  Warnings:

  - Changed the type of `status` on the `Exam` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `Grade` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- Alter Grade.status to Enum
ALTER TABLE "Grade" ALTER COLUMN "status" TYPE "Status" USING ("status"::text::"Status");

-- Alter Exam.status to Enum
ALTER TABLE "Exam" ALTER COLUMN "status" TYPE "Status" USING ("status"::text::"Status");