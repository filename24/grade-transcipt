'use server'

import prisma from '@gt/database'
import * as Sentry from '@sentry/nextjs'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { z } from 'zod'

import { auth } from '@/utils/better-auth'

const EDIT_PATH = '/admin/grade/edit'

// 상한을 두어 단일 호출이 비정상적으로 많은 행을 건드리는 것을 막는다.
const MAX_BULK_IDS = 5000

const GradeIdsSchema = z.object({
  gradeIds: z.array(z.string().uuid()).min(1).max(MAX_BULK_IDS)
})

const UpdateStatusSchema = GradeIdsSchema.extend({
  status: z.enum(['APPROVED', 'PENDING', 'REJECTED', 'NEW'])
})

type UpdateStatusInput = z.infer<typeof UpdateStatusSchema>
type DeleteInput = z.infer<typeof GradeIdsSchema>

type ActionResult =
  | { success: true; count: number }
  | { success: false; error: string }

// 서버 액션은 독립적으로 호출 가능하므로 역할을 반드시 재검증한다.
async function assertAdmin(): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user?.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }
}

export async function updateGradesStatus(
  input: UpdateStatusInput
): Promise<ActionResult> {
  // 인증/검증 실패는 정상적인 비즈니스 결과가 아니라 진짜 오류로 전파시킨다
  // (try/catch 밖에 두어 Sentry 노이즈를 막고 DB 오류와 구분).
  await assertAdmin()
  const { gradeIds, status } = UpdateStatusSchema.parse(input)

  try {
    const { count } = await prisma.grade.updateMany({
      where: { id: { in: gradeIds } },
      data: { status }
    })

    revalidatePath(EDIT_PATH)
    return { success: true, count }
  } catch (error) {
    Sentry.captureException(error, {
      tags: { feature: 'admin-grade-edit', action: 'update-status' },
      extra: { count: gradeIds.length, status }
    })
    return { success: false, error: 'Алдаа гарлаа' }
  }
}

export async function deleteGrades(input: DeleteInput): Promise<ActionResult> {
  await assertAdmin()
  const { gradeIds } = GradeIdsSchema.parse(input)

  try {
    const { count } = await prisma.grade.deleteMany({
      where: { id: { in: gradeIds } }
    })

    revalidatePath(EDIT_PATH)
    return { success: true, count }
  } catch (error) {
    Sentry.captureException(error, {
      tags: { feature: 'admin-grade-edit', action: 'delete' },
      extra: { count: gradeIds.length }
    })
    return { success: false, error: 'Алдаа гарлаа' }
  }
}
