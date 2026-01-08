/*
  Email Unique 인덱스 추가 마이그레이션
  - 기존 데이터 보존
  - user 테이블의 email 컬럼에 unique 인덱스 추가
*/

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");
