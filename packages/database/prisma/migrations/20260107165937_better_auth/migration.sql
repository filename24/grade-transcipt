/*
  Better-Auth Migration Script (Fixed Version)
  - 기존 NextAuth 데이터 보존
  - User, Account, Session, Verification 테이블 구조 변경
  - Duplicate Table Creation 방지
  - FIX: Session 테이블 id 컬럼 추가 및 PK 설정 (Prisma Studio 오류 해결)
*/

-- 1. 테이블 이름 변경 (Prisma 모델명 -> @@map("name") 대응)
ALTER TABLE IF EXISTS "User" RENAME TO "user";
ALTER TABLE IF EXISTS "Account" RENAME TO "account";
ALTER TABLE IF EXISTS "Session" RENAME TO "session";
ALTER TABLE IF EXISTS "VerificationToken" RENAME TO "verification";

-- 2. User 테이블 마이그레이션
-- 2-1. Role Enum을 String으로 변환
ALTER TABLE "user" ALTER COLUMN "role" TYPE TEXT USING "role"::text;

-- 2-2. 새로운 컬럼 추가
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN DEFAULT false;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "image" TEXT;

-- 3. Account 테이블 마이그레이션
-- 3-1. 기본 키(PK) 변경을 위한 ID 컬럼 추가 및 데이터 생성
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "id" TEXT;
UPDATE "account" SET "id" = gen_random_uuid() WHERE "id" IS NULL;
ALTER TABLE "account" ALTER COLUMN "id" SET NOT NULL;

-- 3-2. 기존 복합 PK 삭제 후 새로운 단일 PK 설정
ALTER TABLE "account" DROP CONSTRAINT IF EXISTS "Account_pkey";
ALTER TABLE "account" ADD CONSTRAINT "account_pkey" PRIMARY KEY ("id");

-- 3-3. 컬럼 이름 변경
ALTER TABLE "account" RENAME COLUMN "provider" TO "providerId";
ALTER TABLE "account" RENAME COLUMN "providerAccountId" TO "accountId";
ALTER TABLE "account" RENAME COLUMN "refresh_token" TO "refreshToken";
ALTER TABLE "account" RENAME COLUMN "access_token" TO "accessToken";
ALTER TABLE "account" RENAME COLUMN "id_token" TO "idToken";

-- 3-4. expires_at (Int) -> accessTokenExpiresAt (DateTime) 변환
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "accessTokenExpiresAt" TIMESTAMP(3);
UPDATE "account" SET "accessTokenExpiresAt" = TO_TIMESTAMP("expires_at") WHERE "expires_at" IS NOT NULL;
ALTER TABLE "account" DROP COLUMN IF EXISTS "expires_at";

-- 3-5. 새로운 컬럼 추가
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "refreshTokenExpiresAt" TIMESTAMP(3);
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "password" TEXT;

-- 4. Session 테이블 마이그레이션
ALTER TABLE "session" RENAME COLUMN "sessionToken" TO "token";
ALTER TABLE "session" RENAME COLUMN "expires" TO "expiresAt";

-- [FIX] 4-1. ID 컬럼 추가 및 PK 설정 (Prisma 요구사항 충족)
ALTER TABLE "session" ADD COLUMN IF NOT EXISTS "id" TEXT;
UPDATE "session" SET "id" = gen_random_uuid() WHERE "id" IS NULL;
ALTER TABLE "session" ALTER COLUMN "id" SET NOT NULL;

-- 기존 PK 제약조건 제거 및 새 PK 설정
ALTER TABLE "session" DROP CONSTRAINT IF EXISTS "Session_pkey";
ALTER TABLE "session" DROP CONSTRAINT IF EXISTS "session_pkey";
ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("id");

-- 4-2. 새로운 컬럼 추가
ALTER TABLE "session" ADD COLUMN IF NOT EXISTS "ipAddress" TEXT;
ALTER TABLE "session" ADD COLUMN IF NOT EXISTS "userAgent" TEXT;

-- 5. Verification 테이블 마이그레이션
ALTER TABLE "verification" RENAME COLUMN "token" TO "value";
ALTER TABLE "verification" RENAME COLUMN "expires" TO "expiresAt";

-- 5-1. ID 컬럼 추가 및 PK 설정
ALTER TABLE "verification" ADD COLUMN IF NOT EXISTS "id" TEXT;
UPDATE "verification" SET "id" = gen_random_uuid() WHERE "id" IS NULL;
ALTER TABLE "verification" ALTER COLUMN "id" SET NOT NULL;

ALTER TABLE "verification" DROP CONSTRAINT IF EXISTS "VerificationToken_pkey";
ALTER TABLE "verification" ADD CONSTRAINT "verification_pkey" PRIMARY KEY ("id");

-- 5-2. 타임스탬프 추가
ALTER TABLE "verification" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "verification" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);

-- 6. 인덱스 이름 정리
ALTER INDEX IF EXISTS "User_email_key" RENAME TO "user_email_key";
ALTER INDEX IF EXISTS "User_systemId_key" RENAME TO "user_systemId_key";
ALTER INDEX IF EXISTS "User_firstName_lastName_idx" RENAME TO "user_firstName_lastName_idx";
ALTER INDEX IF EXISTS "Session_sessionToken_key" RENAME TO "session_token_key";

-- 7. 외래 키 제약조건 이름 정리 (선택사항)
ALTER TABLE "account" RENAME CONSTRAINT "Account_userId_fkey" TO "account_userId_fkey";
ALTER TABLE "session" RENAME CONSTRAINT "Session_userId_fkey" TO "session_userId_fkey";