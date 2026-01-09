import prisma from '@gt/database'
import { resolveClassCode } from '@/utils'
import { auth } from '@/utils/better-auth'
import { headers } from 'next/headers'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ academicYear: string; semester: string }> }
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
  const { academicYear, semester } = await params

  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session)
    return Response.json({ message: 'Unauthorized' }, { status: 401 })

  if (session.user?.role !== 'ADMIN')
    return Response.json({ message: 'Unauthorized' }, { status: 403 })

  const grade = await prisma.grade
    .findMany({
      where: {
        academicYear,
        semester: Number(semester)
      },
      select: {
        displayName: true,
        point: true,
        grade: true,
        classCode: true
      }
    })
    .then((raw) =>
      raw
        .map((data) => {
          const { classCode, displayName, grade, point } = data

          return {
            displayName,
            className: resolveClassCode(classCode),
            grade,
            point
          }
        })
        .sort((a, b) =>
          a.className.toLowerCase().localeCompare(b.className.toLowerCase())
        )
    )
  return Response.json({
    data: grade,
    message: 'Success!'
  })
}
