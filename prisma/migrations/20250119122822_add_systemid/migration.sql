/*
  Warnings:

  - Added the required column `academicYear` to the `Grade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `systemId` to the `Grade` table without a default value. This is not possible if the table is not empty.
  - Added the required column `systemId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Grade" ADD COLUMN     "academicYear" TEXT NOT NULL,
ADD COLUMN     "systemId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "systemId" TEXT NOT NULL;
