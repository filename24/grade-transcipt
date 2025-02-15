/*
  Warnings:

  - Added the required column `point` to the `Grade` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Grade" ADD COLUMN     "point" INTEGER NOT NULL,
ALTER COLUMN "grade" SET DATA TYPE TEXT;
