/*
  스키마 동기화 마이그레이션
  - NextAuth 레거시 컬럼 삭제
  - 제약조건 및 기본값 정리
  - better-auth 스키마에 맞춤
  - NULL email을 가짜 email로 채움
*/

-- AlterTable: account (NextAuth 레거시 컬럼 삭제)
ALTER TABLE "account" DROP COLUMN IF EXISTS "session_state";
ALTER TABLE "account" DROP COLUMN IF EXISTS "token_type";
ALTER TABLE "account" DROP COLUMN IF EXISTS "type";
ALTER TABLE "account" ALTER COLUMN "createdAt" DROP DEFAULT;

-- AlterTable: session
ALTER TABLE "session" ALTER COLUMN "createdAt" DROP DEFAULT;

-- AlterTable: user
-- 1. 먼저 NULL email을 가짜 email로 채움
UPDATE "user" SET email = CONCAT("systemId", '@knea.gt') WHERE email IS NULL;

-- 2. PK 이름 변경
ALTER TABLE "user" RENAME CONSTRAINT "User_pkey" TO "user_pkey";

-- 3. 제약조건 변경
ALTER TABLE "user" ALTER COLUMN "createdAt" DROP DEFAULT;
ALTER TABLE "user" ALTER COLUMN "email" SET NOT NULL;
ALTER TABLE "user" ALTER COLUMN "firstName" SET NOT NULL;
ALTER TABLE "user" ALTER COLUMN "lastName" SET NOT NULL;
ALTER TABLE "user" ALTER COLUMN "currectAcademicLevel" DROP DEFAULT;
ALTER TABLE "user" ALTER COLUMN "emailVerified" SET NOT NULL;
ALTER TABLE "user" ALTER COLUMN "emailVerified" DROP DEFAULT;

-- AlterTable: verification
ALTER TABLE "verification" ALTER COLUMN "createdAt" DROP DEFAULT;

-- DropEnum: Role (더 이상 사용하지 않음)
DROP TYPE IF EXISTS "Role";
