'use server'

import prisma from '@gt/database'
import * as Sentry from '@sentry/nextjs'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

import {
  type BulkDeleteInput,
  BulkDeleteSchema,
  CommitBulkSchema,
  type CommitBulkInput,
  PreviewBulkSchema,
  type PreviewBulkInput,
  UpdateUserInfoByIdSchema,
  type UpdateUserInfoByIdInput,
  UpsertUserInfoSchema,
  type UpsertUserInfoInput
} from '@/schemas/userInfo'
import { auth } from '@/utils/better-auth'

import type { MatchCandidate, PreviewRow, UserInfoListRow } from './types'

const MAX_EXPORT_ROWS = 10_000

const INFO_PATH = '/admin/users/info'
const MAX_SEARCH_RESULTS = 20
const MIN_SEARCH_LENGTH = 2

// 서버 액션은 클라이언트에서 독립적으로 호출 가능하므로 역할을 반드시 재검증한다.
async function assertAdmin(): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }
}

// 이름 비교용 정규화: 공백 축약 + 소문자
function normalizeName(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLowerCase()
}

// 붙여넣은 텍스트를 [이름, 값] 행으로 파싱한다. 탭 우선, 없으면 쉼표 fallback.
function parseRows(raw: string): { rawName: string; data: string }[] {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      const cells = (line.includes('\t') ? line.split('\t') : line.split(','))
        .map((cell) => cell.trim())
        .filter((cell) => cell.length > 0)
      return { rawName: cells[0] ?? '', data: cells[1] ?? '' }
    })
}

export async function previewBulkUserInfo(input: PreviewBulkInput) {
  await assertAdmin()
  const { raw } = PreviewBulkSchema.parse(input)

  try {
    const parsed = parseRows(raw)

    // 정규화된 이름 → 후보 유저 목록 (성/이름 조합 포함)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        registerNumber: true
      }
    })

    const lookup = new Map<string, MatchCandidate[]>()
    const addKey = (key: string, candidate: MatchCandidate) => {
      const normalized = normalizeName(key)
      if (!normalized) return
      const list = lookup.get(normalized)
      if (list) {
        if (!list.some((c) => c.id === candidate.id)) list.push(candidate)
      } else {
        lookup.set(normalized, [candidate])
      }
    }

    for (const user of users) {
      const candidate: MatchCandidate = {
        id: user.id,
        name: user.name,
        registerNumber: user.registerNumber
      }
      addKey(user.name, candidate)
      addKey(`${user.lastName} ${user.firstName}`, candidate)
      addKey(`${user.firstName} ${user.lastName}`, candidate)
    }

    const rows: PreviewRow[] = parsed.map((row, index) => {
      const base = { index, rawName: row.rawName, data: row.data }
      if (!row.rawName || !row.data) {
        return { ...base, status: 'not_found' as const }
      }
      const matches = lookup.get(normalizeName(row.rawName)) ?? []
      if (matches.length === 1) {
        return { ...base, status: 'matched' as const, userId: matches[0].id }
      }
      if (matches.length > 1) {
        return { ...base, status: 'ambiguous' as const, candidates: matches }
      }
      return { ...base, status: 'not_found' as const }
    })

    return { success: true as const, data: rows }
  } catch (error) {
    Sentry.captureException(error, {
      tags: { feature: 'admin-user-info', action: 'preview-bulk' }
    })
    return {
      success: false as const,
      error: 'Урьдчилан харах үед алдаа гарлаа'
    }
  }
}

export async function commitBulkUserInfo(input: CommitBulkInput) {
  await assertAdmin()
  const { name, entries } = CommitBulkSchema.parse(input)

  try {
    await prisma.$transaction(
      entries.map((entry) =>
        prisma.userInfo.upsert({
          where: { userId_name: { userId: entry.userId, name } },
          create: { userId: entry.userId, name, data: entry.data },
          update: { data: entry.data }
        })
      )
    )

    revalidatePath(INFO_PATH)
    return { success: true as const, count: entries.length }
  } catch (error) {
    Sentry.captureException(error, {
      tags: { feature: 'admin-user-info', action: 'commit-bulk' },
      extra: { name, count: entries.length }
    })
    return { success: false as const, error: 'Хадгалах үед алдаа гарлаа' }
  }
}

export async function searchUsersByName(query: string) {
  await assertAdmin()
  const trimmed = query.trim()
  if (trimmed.length < MIN_SEARCH_LENGTH) {
    return { success: true as const, data: [] as MatchCandidate[] }
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: trimmed, mode: 'insensitive' } },
          { firstName: { contains: trimmed, mode: 'insensitive' } },
          { lastName: { contains: trimmed, mode: 'insensitive' } }
        ]
      },
      // 기존 UserTable과 동일하게 이름(firstName) 순으로 정렬한다.
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
      select: { id: true, name: true, registerNumber: true },
      take: MAX_SEARCH_RESULTS
    })

    return { success: true as const, data: users }
  } catch (error) {
    Sentry.captureException(error, {
      tags: { feature: 'admin-user-info', action: 'search-users' }
    })
    return { success: false as const, error: 'Хайлт амжилтгүй боллоо' }
  }
}

export async function listUserInfo(userId: string) {
  await assertAdmin()
  try {
    const items = await prisma.userInfo.findMany({
      where: { userId },
      orderBy: { name: 'asc' }
    })
    return { success: true as const, data: items }
  } catch (error) {
    Sentry.captureException(error, {
      tags: { feature: 'admin-user-info', action: 'list' },
      extra: { userId }
    })
    return { success: false as const, error: 'Жагсаалт ачаалахад алдаа гарлаа' }
  }
}

export async function upsertUserInfo(input: UpsertUserInfoInput) {
  await assertAdmin()
  const { userId, name, data } = UpsertUserInfoSchema.parse(input)

  try {
    const item = await prisma.userInfo.upsert({
      where: { userId_name: { userId, name } },
      create: { userId, name, data },
      update: { data }
    })
    revalidatePath(INFO_PATH)
    return { success: true as const, data: item }
  } catch (error) {
    Sentry.captureException(error, {
      tags: { feature: 'admin-user-info', action: 'upsert' },
      extra: { userId, name }
    })
    return { success: false as const, error: 'Хадгалах үед алдаа гарлаа' }
  }
}

export async function deleteUserInfo(id: string) {
  await assertAdmin()
  try {
    await prisma.userInfo.delete({ where: { id } })
    revalidatePath(INFO_PATH)
    return { success: true as const, message: 'Устгагдлаа' }
  } catch (error) {
    Sentry.captureException(error, {
      tags: { feature: 'admin-user-info', action: 'delete' },
      extra: { id }
    })
    return { success: false as const, error: 'Устгахад алдаа гарлаа' }
  }
}

// 선택한 항목 일괄 삭제 (PK 배열 기준)
export async function deleteUserInfoBulk(input: BulkDeleteInput) {
  await assertAdmin()
  const { ids } = BulkDeleteSchema.parse(input)

  try {
    const { count } = await prisma.userInfo.deleteMany({
      where: { id: { in: ids } }
    })
    revalidatePath(INFO_PATH)
    return { success: true as const, count }
  } catch (error) {
    Sentry.captureException(error, {
      tags: { feature: 'admin-user-info', action: 'delete-bulk' },
      extra: { count: ids.length }
    })
    return { success: false as const, error: 'Устгахад алдаа гарлаа' }
  }
}

// PK 기준 수정 (항목 이름 변경 허용). 같은 유저에 동일 이름이 이미 있으면 충돌.
export async function updateUserInfoById(input: UpdateUserInfoByIdInput) {
  await assertAdmin()
  const { id, name, data } = UpdateUserInfoByIdSchema.parse(input)

  try {
    const item = await prisma.userInfo.update({
      where: { id },
      data: { name, data }
    })
    revalidatePath(INFO_PATH)
    return { success: true as const, data: item }
  } catch (error) {
    // Prisma unique 제약 위반(P2002): 동일 항목 이름이 이미 존재
    if ((error as { code?: string }).code === 'P2002') {
      return {
        success: false as const,
        error: 'Тухайн нэртэй мэдээлэл аль хэдийн байна'
      }
    }
    Sentry.captureException(error, {
      tags: { feature: 'admin-user-info', action: 'update-by-id' },
      extra: { id, name }
    })
    return { success: false as const, error: 'Хадгалах үед алдаа гарлаа' }
  }
}

// 항목 이름(scope) 기준 where 빌더. 학생 이름 검색은 클라이언트에서 처리한다.
function buildListWhere(name?: string) {
  return name ? { name } : {}
}

// 입력된 모든 항목 이름 (필터 드롭다운용)
export async function listFieldNames() {
  await assertAdmin()
  try {
    const rows = await prisma.userInfo.findMany({
      distinct: ['name'],
      select: { name: true },
      orderBy: { name: 'asc' }
    })
    return { success: true as const, data: rows.map((r) => r.name) }
  } catch (error) {
    Sentry.captureException(error, {
      tags: { feature: 'admin-user-info', action: 'list-field-names' }
    })
    return { success: false as const, error: 'Ачаалахад алдаа гарлаа' }
  }
}

// 전체 목록 (학생 정보 포함, 페이지네이션)
// 항목(scope)에 해당하는 전체 행을 한 번에 로드한다 (서버 페이지네이션 없음).
// 페이지네이션·정렬·검색·선택은 grade/edit과 동일하게 클라이언트에서 처리한다.
export async function loadAllUserInfo(name?: string) {
  await assertAdmin()
  const where = buildListWhere(name?.trim() || undefined)

  try {
    const items = await prisma.userInfo.findMany({
      where,
      select: {
        id: true,
        name: true,
        data: true,
        user: { select: { name: true, registerNumber: true } }
      },
      // 기본 정렬(클라이언트에서 givenNameSort로 재정렬). 상한으로 과도한 로드 방지.
      orderBy: [{ name: 'asc' }, { updatedAt: 'desc' }],
      take: MAX_EXPORT_ROWS
    })

    const rows: UserInfoListRow[] = items.map((item) => ({
      id: item.id,
      name: item.name,
      data: item.data,
      studentName: item.user.name,
      registerNumber: item.user.registerNumber
    }))

    return { success: true as const, data: rows }
  } catch (error) {
    Sentry.captureException(error, {
      tags: { feature: 'admin-user-info', action: 'load-all' },
      extra: { name }
    })
    return { success: false as const, error: 'Жагсаалт ачаалахад алдаа гарлаа' }
  }
}
