/*
  Warnings:

  - The primary key for the `account` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `accessTokenExpiresAt` column on the `account` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `id` to the `account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `session` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "account" DROP CONSTRAINT "account_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
DROP COLUMN "accessTokenExpiresAt",
ADD COLUMN     "accessTokenExpiresAt" TIMESTAMP(3),
ALTER COLUMN "createdAt" DROP DEFAULT,
ADD CONSTRAINT "account_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "session" ADD COLUMN     "id" TEXT NOT NULL,
ALTER COLUMN "createdAt" DROP DEFAULT,
ADD CONSTRAINT "session_pkey" PRIMARY KEY ("id");
