-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('Medle', 'ESIS', 'GrandIT');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "classId" TEXT NOT NULL DEFAULT '100004237680887',
ADD COLUMN     "email" TEXT,
ADD COLUMN     "schoolId" TEXT NOT NULL DEFAULT '40301',
ADD COLUMN     "type" "UserType" NOT NULL DEFAULT 'ESIS';
