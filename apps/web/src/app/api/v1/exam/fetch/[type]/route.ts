import * as Sentry from '@sentry/nextjs'
import { headers } from 'next/headers'

import { auth } from '@/utils/better-auth'
import { STUDENT_GROUP_ID } from '@/utils/constants'
import { type FetchType, fetchTestData } from '@/utils/fetch'

// Hobby 플랜 함수 실행 상한(60초)에 맞춰 최대 실행 시간을 명시한다.
// ESIS 세션별 순차 호출이 길어질 수 있어 기본 제한(10초)으로는 504가 난다.
export const maxDuration = 60
export const dynamic = 'force-dynamic'

/**
 * 요청자가 ADMIN 세션을 가졌거나, CRON_SECRET Bearer 토큰을 제시했는지 검증한다.
 * 인증을 통과하지 못하면 Response(401/403)를, 통과하면 null을 반환한다.
 */
async function authorize(request: Request): Promise<Response | null> {
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const authHeader = request.headers.get('authorization')
    if (authHeader === `Bearer ${cronSecret}`) {
      return null
    }
  }

  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 })
  }

  if (session.user?.role !== 'ADMIN') {
    return Response.json({ message: 'Forbidden' }, { status: 403 })
  }

  return null
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  if (!params) {
    return Response.json(
      {
        data: null,
        message: 'Params are required'
      },
      { status: 400 }
    )
  }

  // 쓰기를 유발하는 엔드포인트이므로 인증을 강제한다.
  const unauthorized = await authorize(request)
  if (unauthorized) {
    return unauthorized
  }

  const type = (await params).type as FetchType

  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const studentExamData = await fetchTestData(STUDENT_GROUP_ID, type)

    return Response.json(
      {
        data: {
          size:
            typeof studentExamData === 'number'
              ? studentExamData
              : // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                studentExamData.length
        },
        message: 'Success'
      },
      { status: 200 }
    )
  } catch (error) {
    Sentry.captureException(error, {
      tags: { feature: 'fetch-test-data', operation: type },
      extra: { groupId: STUDENT_GROUP_ID, type }
    })

    return Response.json(
      {
        data: null,
        message: 'Failed to fetch exam data'
      },
      { status: 500 }
    )
  }
}
