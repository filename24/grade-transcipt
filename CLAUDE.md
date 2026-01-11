# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

**Knea - Grade Transcript**는 몽골 교육부 ESIS API와 통합되어 학생 성적을 조회/관리하는 웹 애플리케이션입니다.

- **UI 언어**: 몽골어 (키릴 문자)
- **코드 주석**: 한국어 또는 영어

## 기술 스택

- **Framework**: Next.js 16 (App Router, React 19, Turbopack)
- **Monorepo**: Turborepo + pnpm workspaces
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: Better Auth (몽골 주민등록번호 기반 커스텀 인증 + Passkey)
- **Caching**: Redis (Upstash)
- **UI**: shadcn/ui + Tailwind CSS v4
- **Code Quality**: BiomeJS

## 필수 명령어

```bash
# 개발 서버 시작
pnpm dev

# 빌드
pnpm build

# 린팅/포매팅 (BiomeJS)
pnpm lint

# Prisma Client 생성 (스키마 변경 후 필수)
pnpm generate

# 데이터베이스 마이그레이션
pnpm db:migrate:dev          # 개발 마이그레이션 생성
pnpm db:migrate:deploy       # 프로덕션 배포

# 개별 워크스페이스 작업
pnpm --filter web dev
pnpm --filter @gt/database db:push
pnpm --filter @gt/database studio
```

## 프로젝트 구조

```
grade-transcript/
├── apps/web/                 # Next.js 메인 앱
│   └── src/
│       ├── app/
│       │   ├── (auth)/       # 인증 페이지 (네비게이션 없음)
│       │   ├── (dashboard)/  # 학생 대시보드 (Navbar + Footer)
│       │   ├── (sidebar)/    # 관리자/교사 페이지 (Sidebar 레이아웃)
│       │   └── api/
│       ├── components/
│       ├── utils/
│       │   ├── better-auth.ts      # Better Auth 서버 설정
│       │   ├── auth-client.ts      # Better Auth 클라이언트
│       │   ├── auth-permissions.ts # RBAC 권한 정의
│       │   ├── auth-plugins/       # 커스텀 인증 플러그인
│       │   └── esis.ts             # ESIS API 연결
│       └── schemas/
├── packages/
│   ├── database/             # Prisma 스키마 및 클라이언트
│   ├── esis/                 # ESIS API SDK
│   └── tsconfig/             # 공유 TypeScript 설정
```

## 인증 시스템 (Better Auth)

### 아키텍처

- 커스텀 플러그인: `registerNumberAuth` (몽골 주민등록번호 인증)
- 추가 플러그인: `passkey`, `admin` (RBAC)
- 쿠키 접두사: `knea-gt`

### 사용자 역할

- `ADMIN`: 모든 관리 권한 (user CRUD, session 관리, ban/unban)
- `TEACHER`: 관리 권한 없음
- `STUDENT`: 관리 권한 없음 (기본 역할)

### 인증 흐름

1. 사용자가 주민등록번호 입력 (형식: `АБ12345678` - 키릴 2글자 + 숫자 8자리)
2. `User` 테이블에서 `registerNumber`로 조회
3. 없으면 `Grade` 테이블에서 해당 등록번호의 성적 데이터 조회
4. 성적 데이터 있으면 자동으로 User 생성 (name, systemId, role='STUDENT')
5. 비밀번호 설정된 유저는 비밀번호 검증 필요

### 서버 사용

```typescript
import { auth } from '@/utils/better-auth'
import { headers } from 'next/headers'

const session = await auth.api.getSession({ headers: await headers() })
```

### 클라이언트 사용

```typescript
import { authClient } from '@/utils/auth-client'

const { data: session } = authClient.useSession()
```

## 데이터베이스 관계

**핵심**: User와 Grade/Exam은 `systemId`로 연결됩니다 (id가 아님).

- **User.systemId** ← → **Grade.systemId** (1:N)
- **User.systemId** ← → **Exam.systemId** (1:N)
- **User.registerNumber**: 인증에 사용 (unique)

### Admin 플러그인 필드 (User 테이블)

- `banned`: Boolean - 차단 여부
- `banReason`: String - 차단 사유
- `banExpires`: DateTime - 차단 만료일

## ESIS API

`packages/esis`에서 ESIS API SDK 제공. Redis에 JWT 토큰 7일간 캐싱.

**API 문서**: `docs/esis_api_rst.txt` - ESIS 엔드포인트 목록 (몽골어). ESIS와 통신할 때 반드시 이 문서를 참조할 것.

```typescript
import esis from '@/utils/esis'

const data = await esis.get('/svc/api/endpoint')
```

## BiomeJS 규칙

- 들여쓰기: 2 spaces
- 줄 너비: 80자
- 따옴표: JS/TS는 single, JSX는 double
- 세미콜론: 필요한 곳만 (asNeeded)
- 후행 쉼표: 없음
- Tailwind 클래스 자동 정렬: `useSortedClasses` (error 레벨)

## 주의사항

1. **Prisma Client 생성**: 스키마 변경 시 반드시 `pnpm generate` 실행
2. **BiomeJS 단독 사용**: ESLint/Prettier와 함께 사용하지 않음
3. **패키지 의존성**: `packages/*` 먼저 빌드 후 `apps/web` 사용
4. **Turbopack**: `next dev --turbo` 사용 (빠른 개발 빌드)

## MCP 활용

작업 시 다음 MCP 서버를 통해 최신 문서를 참조할 것:

- **Better Auth**: `mcp__better-auth__search` / `mcp__better-auth__chat` - 인증 관련 작업 시 반드시 MCP로 문서 검색
- **shadcn/ui**: `mcp__shadcn__search_items_in_registries` / `mcp__shadcn__view_items_in_registries` - 컴포넌트 추가/수정 시 MCP로 최신 API 확인

### 사용 예시

```
# Better Auth 문서 검색
mcp__better-auth__search({ query: "passkey authentication setup" })

# shadcn 컴포넌트 검색
mcp__shadcn__search_items_in_registries({ registries: ["@shadcn"], query: "button" })
```

## Git 커밋 가이드라인

Conventional Commits 스타일을 사용합니다.

### 커밋 메시지 형식

```
<type>(<scope>): <description>
```

### Type

- `feat`: 새로운 기능 추가
- `fix`: 버그 수정
- `chore`: 빌드, 설정, 의존성 등 유지보수
- `style`: 코드 포맷팅 (BiomeJS 등)
- `refactor`: 기능 변경 없는 코드 구조 개선
- `docs`: 문서 수정
- `perf`: 성능 개선

### Scope (선택)

- `deps`: 의존성 업데이트
- `biome`: BiomeJS 관련
- `sentry`: Sentry 관련
- `auth`: 인증 관련
- `db`: 데이터베이스 관련

### 예시

```
feat: add passkey authentication support
fix(auth): resolve session expiration issue
chore(deps): bump next from 16.0.1 to 16.0.7
style(biome): fixed biome style format [skip ci]
refactor: simplify grade calculation logic
```

### 특수 태그

- `[skip ci]`: CI 빌드 건너뛰기 (스타일 수정 등)

## 오류 보고 (Sentry)

이 프로젝트는 Sentry를 통해 오류를 추적합니다. 오류가 발생하거나 발생할 수 있는 상황에서는 반드시 Sentry를 통해 오류를 보고할 수 있는 체계를 구현해야 합니다.

### 필수 원칙

1. **예외 처리 시 Sentry 보고**: try-catch 블록에서 예상치 못한 오류를 잡을 때 Sentry에 보고
2. **사용자 컨텍스트 포함**: 가능한 경우 사용자 정보, 요청 정보 등 디버깅에 필요한 컨텍스트 첨부
3. **오류 심각도 구분**: 치명적 오류와 경고 수준 오류를 적절히 구분

### 사용 예시

```typescript
import * as Sentry from '@sentry/nextjs'

// 오류 캡처 (throw 하는 경우)
try {
  await riskyOperation()
} catch (error) {
  Sentry.captureException(error, {
    tags: { feature: 'grade-sync' },
    extra: { userId, registerNumber }
  })
  throw error
}

// 오류 캡처 (throw 하지 않고 처리하는 경우)
try {
  await optionalOperation()
} catch (error) {
  Sentry.captureException(error, {
    level: 'warning',
    tags: { feature: 'optional-sync' }
  })
  // 오류를 삼키고 기본값 반환 등 대체 처리
  return defaultValue
}

// 메시지 기록
Sentry.captureMessage('Unusual behavior detected', 'warning')

// 사용자 컨텍스트 설정
Sentry.setUser({ id: userId, username: registerNumber })
```

### 적용 대상

- API 라우트의 예외 처리
- Server Actions의 오류 핸들링
- 외부 API 통신 실패 (ESIS 등)
- 인증 흐름의 예상치 못한 오류
- 데이터베이스 작업 실패

## 데이터베이스 마이그레이션 정책

**중요**: 모든 마이그레이션은 기존 데이터를 반드시 보존해야 합니다.

### 필수 원칙

1. **데이터 손실 금지**: 컬럼 삭제, 테이블 삭제, 타입 변경 등 데이터 손실 가능성이 있는 작업은 사전 승인 필요
2. **허락 절차**: 다음 경우 반드시 사용자에게 확인 요청:
   - 컬럼/테이블 삭제
   - 컬럼 타입 변경 (호환되지 않는 경우)
   - NOT NULL 제약조건 추가 (기존 데이터에 영향)
   - UNIQUE 제약조건 추가 (중복 데이터 존재 가능)
   - 관계 변경 (외래키 수정/삭제)

### 안전한 마이그레이션 패턴

```sql
-- 컬럼 추가 (안전)
ALTER TABLE "user" ADD COLUMN "newField" TEXT;

-- 컬럼 삭제 전 (승인 필요)
-- 1. 먼저 사용자에게 확인
-- 2. 데이터 백업 확인
-- 3. 그 후 삭제 진행

-- 타입 변경 (데이터 보존)
ALTER TABLE "user" ALTER COLUMN "field" TYPE TEXT USING "field"::TEXT;
```

### 마이그레이션 워크플로우

1. 스키마 변경 전 영향 분석
2. 데이터 손실 위험이 있으면 사용자에게 확인
3. 안전한 마이그레이션 SQL 작성
4. 개발 환경에서 테스트
5. 프로덕션 배포
