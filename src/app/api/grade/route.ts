import { getAllStudentGrade, resolveClassCode } from '@/utils'
import { auth } from '@/utils/auth'

export const GET = auth(async (request) => {
  if (!request.auth)
    return Response.json(
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

  return Response.json(
    {
      message: 'Success!',
      data
    },
    {
      status: 200
    }
  )
})
