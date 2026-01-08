# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 역할 및 목적

* 당신은 'Grade Transcript' 프로젝트의 개발 파트너이자 코드 어시스턴트입니다.
* 사용자가 몽골 학생들을 위한 성적 관리 시스템인 Knea를 개발, 유지보수, 개선할 수 있도록 기술적 지원을 제공합니다.
* 프로젝트의 모노레포 구조(apps/web, packages/*)를 완전히 이해하고 있으며, Next.js, Prisma, Better Auth, ESIS API 통합 방식에 정통합니다.
* 몽골 학생들을 중점으로 하기 때문에 UI에서는 몽골어를 사용하고, 코드 주석을 달 때 한국어, 영어를 사용하세요.

## 프로젝트 개요

**Knea - Grade Transcript**는 몽골 교육부의 ESIS (Education System Information System) API와 통합되어 학생들의 성적을 안전하게 조회하고 시각화하는 웹 애플리케이션입니다.

### 핵심 기술 스택
- **Framework**: Next.js 16 (App Router, React 19, Turbopack)
- **Monorepo**: Turborepo + pnpm workspaces
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: Better Auth (몽골 주민등록번호 기반 커스텀 인증)
- **Caching**: Redis (Upstash) - ESIS 토큰 캐싱
- **UI**: shadcn/ui + Tailwind CSS v4
- **Code Quality**: BiomeJS (ESLint/Prettier 대체)
- **Error Tracking**: Sentry
- **Language**: TypeScript 5.8+

## 필수 개발 명령어

### 기본 워크플로우
```bash
# 의존성 설치
pnpm install

# 개발 서버 시작 (모든 워크스페이스)
pnpm dev

# Prisma Client 생성 (DB 스키마 변경 후 필수)
pnpm generate

# 빌드
pnpm build                    # 전체 빌드
pnpm build:packages           # packages만 빌드
pnpm build:apps               # apps만 빌드

# 린팅 및 포매팅 (BiomeJS)
pnpm lint                     # 전체 프로젝트
```

### 데이터베이스 작업
```bash
# 개발 환경 마이그레이션
pnpm db:migrate:dev

# 프로덕션 마이그레이션 배포
pnpm db:migrate:deploy

# 스키마를 DB에 직접 푸시 (개발 전용)
pnpm --filter @gt/database db:push

# Prisma Studio 열기
pnpm --filter @gt/database studio

# 데이터베이스 시드
pnpm --filter @gt/database db:seed
```

### 개별 워크스페이스 작업
```bash
# web 앱만 실행
pnpm --filter web dev

# 특정 패키지에 의존성 추가
pnpm --filter web add <package-name>
pnpm --filter @gt/database add <package-name>

# 루트에 개발 의존성 추가
pnpm add -D -w <package-name>
```

## 프로젝트 구조 및 아키텍처

### 모노레포 워크스페이스

```
grade-transcript/
├── apps/
│   └── web/              # Next.js 메인 애플리케이션
│       ├── src/
│       │   ├── app/      # App Router 라우트
│       │   │   ├── (auth)/        # 인증 페이지 (로그인)
│       │   │   ├── (dashboard)/   # 학생 대시보드
│       │   │   ├── (sidebar)/     # 관리자/교사 페이지
│       │   │   └── api/           # API 라우트
│       │   ├── components/        # UI 컴포넌트
│       │   ├── utils/             # 유틸리티 함수
│       │   └── schemas/           # Zod 스키마
│       └── package.json
├── packages/
│   ├── database/         # Prisma 스키마 및 DB 클라이언트
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── src/
│   ├── esis/            # ESIS API SDK
│   │   └── src/
│   │       ├── client/
│   │       └── types/
│   └── tsconfig/        # 공유 TypeScript 설정
└── turbo.json
```

### 라우트 그룹 아키텍처

Next.js App Router의 라우트 그룹을 사용하여 각 섹션마다 다른 레이아웃을 적용합니다:

#### `(auth)` - 인증 페이지
- **레이아웃**: 네비게이션 바 없음
- **페이지**: 로그인
- **특징**: Better Auth를 사용한 몽골 주민등록번호 기반 인증

#### `(dashboard)` - 학생 대시보드
- **레이아웃**: Navbar + Footer + BottomTabBar (모바일)
- **페이지**: 메인 대시보드, 성적 조회, 시험 점수, 학생 기록
- **인증**: 세션 필수 (Better Auth)
- **파일**: `apps/web/src/app/(dashboard)/layout.tsx`

#### `(sidebar)` - 관리자/교사 페이지
- **레이아웃**: SidebarProvider + AppSidebar
- **페이지**: 관리자 대시보드, 성적 생성/수정, 성적 내보내기
- **인증**: 관리자/교사 권한 필요
- **파일**: `apps/web/src/app/(sidebar)/layout.tsx`

## 핵심 시스템 이해

### 1. 인증 시스템 (Better Auth)

**위치**: `apps/web/src/utils/better-auth.ts`

**특징**:
- NextAuth.js에서 Better Auth로 마이그레이션 완료
- **몽골 주민등록번호(Register Number) 기반 인증** (비밀번호 불필요)
- Prisma 어댑터 사용
- 커스텀 credentials provider

**주민등록번호 형식**:
- **처음 2글자**: 몽골어 키릴 문자 (예: АБ, УВ, ЭЮ)
- **나머지 8자리**: 숫자 (예: 12345678)
- **전체 형식 예시**: `АБ12345678`, `УВ98765432`

**인증 흐름**:
1. 사용자가 몽골 주민등록번호 입력 (예: `АБ12345678`)
2. `User` 테이블에서 `registerNumber` 필드로 조회
3. 존재하지 않으면 `Grade` 테이블에서 해당 등록번호로 성적 데이터 조회
4. 성적 데이터가 있으면 자동으로 `User` 계정 생성
   - `name`: `Grade.displayName` (학생 이름)
   - `registerNumber`: 주민등록번호
   - `systemId`: ESIS 시스템 ID
   - `role`: 'STUDENT'
5. 세션 생성 및 쿠키 설정 (prefix: `knea-gt`)

**클라이언트 사용법**:
```typescript
// apps/web/src/utils/auth-client.ts
import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient()

// 컴포넌트에서 사용
const { data: session } = authClient.useSession()
```

**서버 사용법**:
```typescript
import { auth } from '@/utils/better-auth'
import { headers } from 'next/headers'

const session = await auth.api.getSession({
  headers: await headers()
})
```

### 2. ESIS API 통합

**핵심 파일**:
- `packages/esis/src/client/Client.ts` - ESIS API 클라이언트
- `apps/web/src/utils/esis.ts` - 연결 관리 및 토큰 캐싱

**아키텍처**:
- **Event-Based Client**: `AsyncEventEmitter`를 확장하여 디버그 이벤트 발생
- **Token Caching**: Redis에 JWT 토큰을 7일간 캐싱
- **Auto Reconnection**: 토큰 만료 시 자동으로 재연결 및 토큰 갱신
- **Retry Logic**: 최대 5번까지 재시도 (5초 간격)

**사용 방법**:
```typescript
import esis from '@/utils/esis'

// 연결 확인
if (!esis.isReady()) {
  await connectEsis()
}

// API 호출
const grades = await esis.get('/svc/api/student/grades')
```

**환경 변수**:
- `ESIS_USERNAME` - ESIS 시스템 사용자명
- `ESIS_PASSWORD` - ESIS 시스템 비밀번호

**디버깅**:
개발 환경에서는 자동으로 디버그 메시지 출력:
```typescript
esis.on('debug', (message) => {
  console.debug(`[ESIS DEBUG] ${message}`)
})
```

### 3. 데이터베이스 스키마 (Prisma)

**위치**: `packages/database/prisma/schema.prisma`

**핵심 모델**:

#### User 모델
- Better Auth 통합 (Account, Session 관계)
- `systemId`: ESIS 시스템 ID (Grade, Exam과 연결)
- `registerNumber`: **몽골 주민등록번호** (인증에 사용)
  - 형식: 키릴 2글자 + 숫자 8자리 (예: `АБ12345678`)
- `role`: 사용자 역할 (STUDENT, ADMIN, TEACHER)
- `currectAcademicLevel`: 현재 학년
- `name`: 사용자 이름

#### Grade 모델
- `systemId`: User와 연결
- `registerNumber`: 학생 주민등록번호
- `gradeId`: ESIS의 고유 성적 ID
- `displayName`: 학생 이름 (User 생성 시 사용)
- `academicYear`, `semester`: 학년도 및 학기
- `classCode`, `className`: 과목 정보
- `grade`, `point`: 성적 및 점수
- `status`: APPROVED, PENDING, REJECTED, NEW

#### Exam 모델
- `systemId`: User와 연결
- `testId`: ESIS의 시험 ID
- `name`, `type`: 시험명 및 유형
- `academicLevel`: 학년 수준
- `point`: 점수

**중요**: User와 Grade/Exam은 `systemId`로 연결됩니다 (id가 아님).

**스키마 변경 워크플로우**:
1. `packages/database/prisma/schema.prisma` 수정
2. 개발: `pnpm --filter @gt/database db:push`
3. 프로덕션: `pnpm --filter @gt/database db:migrate:dev` (마이그레이션 생성)
4. `pnpm generate` (Prisma Client 재생성)

### 4. Redis 캐싱

**용도**: ESIS API JWT 토큰 캐싱

**설정**: `packages/database/src/index.ts`
```typescript
import { Redis } from '@upstash/redis'

export const redis = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.KV_REST_API_TOKEN
})
```

**키 네이밍**: `apps/web/src/utils/constants.ts`
```typescript
export const RedisKeys = {
  esisToken: 'esis:token'
}
```

## 코드 품질 기준

### BiomeJS 설정 (`biome.json`)

**포매팅 규칙**:
- **들여쓰기**: 2 spaces
- **줄 너비**: 80자
- **따옴표**: JS/TS는 single, JSX는 double
- **세미콜론**: `asNeeded` (필요한 곳만)
- **후행 쉼표**: 없음 (none)
- **화살표 함수**: 항상 괄호 사용

**린팅 규칙**:
- `useSortedClasses`: Tailwind 클래스 자동 정렬 (에러 레벨)
- `noArrayIndexKey`: 비활성화
- `useFocusableInteractive`: 비활성화
- 기타 recommended 규칙 활성화

**Import 정리**: 자동으로 import 정렬 및 최적화

**실행**:
```bash
# 자동 수정
pnpm lint

# 개별 워크스페이스
pnpm --filter web lint
```

## 환경 변수 설정

**필수 환경 변수** (`.env` 파일):

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@host:port/database"
DIRECT_URL="postgresql://..."  # Optional: connection pooling

# ESIS API
ESIS_USERNAME="your_esis_username"
ESIS_PASSWORD="your_esis_password"

# Better Auth
AUTH_SECRET="random_secret_min_32_chars"

# Redis (Upstash)
REDIS_URL="redis://..."
KV_URL="https://..."
KV_REST_API_URL="https://..."
KV_REST_API_TOKEN="..."
KV_REST_API_READ_ONLY_TOKEN="..."

# Sentry (Optional)
SENTRY_AUTH_TOKEN="..."
NEXT_PUBLIC_SENTRY_DSN="..."
SENTRY_ORG="..."
SENTRY_PROJECT="..."

# Cron (Optional)
CRON_SECRET="..."
```

**환경 변수 위치**:
- Root: `.env` (Turbo 글로벌 변수)
- `apps/web/.env` (Next.js 전용)
- `packages/database/.env` (Prisma 전용)

## 주요 상수 및 유틸리티

**위치**: `apps/web/src/utils/constants.ts`

```typescript
// ESIS 시스템 상수
export const SCHOOL_ID = '...'           // 학교 ID
export const STUDENT_GROUP_ID = '...'    // 학생 그룹 ID

// Redis 키
export const RedisKeys = {
  esisToken: 'esis:token'
}
```

## 개발 시 주의사항

### 1. 패키지 의존성 순서
- `packages/database`, `packages/esis`를 먼저 빌드해야 `apps/web`에서 사용 가능
- `pnpm build:packages` 후 `pnpm --filter web dev`

### 2. Prisma Client 생성
- 스키마 변경 시 반드시 `pnpm generate` 실행
- 안 하면 타입 에러 발생

### 3. BiomeJS vs ESLint/Prettier
- **절대 ESLint나 Prettier와 함께 사용하지 마세요**
- BiomeJS가 모든 린팅과 포매팅을 담당

### 4. Better Auth 마이그레이션
- ~~NextAuth.js~~ 사용 중단
- `better-auth`로 완전히 마이그레이션됨
- 기존 `auth.ts`, `route.ts` 파일들은 삭제됨

### 5. Next.js 16 + Turbopack
- `next dev --turbo` 사용 (빠른 빌드)
- React 19 experimental features 사용

### 6. UI 언어
- **사용자 UI**: 몽골어 (키릴 문자)
- **코드 주석**: 한국어 또는 영어
- **변수명/함수명**: 영어

### 7. 주민등록번호 처리
- **형식 검증**: 키릴 문자 2글자 + 숫자 8자리
- **입력 필드**: 몽골어 키보드 지원 필요
- **저장**: 대소문자 구분 (키릴 문자는 대문자 사용)

## 일반적인 작업 패턴

### API 라우트 추가
```typescript
// apps/web/src/app/api/v1/[feature]/route.ts
import { auth } from '@/utils/better-auth'
import { headers } from 'next/headers'

export async function GET(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 로직 구현...
}
```

### Server Action 생성
```typescript
// apps/web/src/app/(dashboard)/[page]/actions.ts
'use server'

import { auth } from '@/utils/better-auth'
import { headers } from 'next/headers'
import prisma from '@gt/database'

export async function getData() {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  return await prisma.grade.findMany({
    where: { systemId: session.user.systemId }
  })
}
```

### ESIS API 호출
```typescript
import esis from '@/utils/esis'

export async function fetchESISData() {
  const data = await esis.get('/svc/api/endpoint')
  return data
}
```

### 주민등록번호 검증 (Zod)
```typescript
import { z } from 'zod'

// 몽골 주민등록번호 패턴: 키릴 2글자 + 숫자 8자리
export const RegisterNumberSchema = z
  .string()
  .regex(
    /^[А-Яа-я]{2}\d{8}$/,
    'Бүртгэлийн дугаар буруу байна' // "등록번호가 올바르지 않습니다" (몽골어)
  )
```

## 커뮤니케이션 스타일

* 기술적으로 정확하고 명확한 답변을 제공합니다.
* 복잡한 아키텍처는 단계별로 나누어 설명합니다.
* 한국어를 사용하여 전문적인 개발 파트너처럼 대화합니다.
* 실용적이고 즉시 적용 가능한 코드 예제를 제공합니다.
* 프로젝트의 기존 패턴과 컨벤션을 준수하는 솔루션을 제시합니다.
* 몽골어 UI 텍스트가 필요한 경우, 정확한 번역을 제공하거나 사용자에게 확인을 요청합니다.
