import { getAllStudentGrade, resolveClassCode } from '@/utils'
import { auth } from '@/utils/auth'
import { NextResponse } from 'next/server'

export const GET = auth(async (request) => {
  if (!request.auth)
    return NextResponse.json(
      { message: 'Unauthorized', data: null },
      { status: 401 }
    )

  const raw = await getAllStudentGrade(1)

  const data = raw.map((grade) => ({
    studentName: grade.displayName,
    className: resolveClassCode(grade.classCode),
    grade: grade.grade,
    point: grade.point,
    status: grade.status,
    teacherName: grade.teacherName
  }))

  return NextResponse.json(
    {
      message: 'Success!',
      data
    },
    {
      status: 200
    }
  )
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}) as any
