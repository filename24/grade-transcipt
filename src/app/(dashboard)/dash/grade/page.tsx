import { getStudentGrade, resolveClassCode } from '@/utils'
import { getSession } from '@/utils/auth'
import { redirect } from 'next/navigation'

import { GradeTableData } from './_Components/GradeTable'
import GradeLayout from './_Components/GradeLayout'
import { headers } from 'next/headers'

export default async function GradePage() {
  const session = await getSession(await headers())

  if (!session?.user?.name) {
    return redirect('/login')
  }

  const semester1GradeRaw = await getStudentGrade(session.user.name, 1)
  const semester2GradeRaw = await getStudentGrade(session.user.name, 2)

  const semester1Data = semester1GradeRaw.map(
    (grade): GradeTableData => ({
      className: resolveClassCode(grade.classCode),
      grade: grade.grade,
      point: grade.point,
      status: grade.status
    })
  )

  const semester2Data = semester2GradeRaw.map(
    (grade): GradeTableData => ({
      className: resolveClassCode(grade.classCode),
      grade: grade.grade,
      point: grade.point,
      status: grade.status
    })
  )

  return (
    <div className="p-2">
      <GradeLayout semester1={semester1Data} semester2={semester2Data} />
    </div>
  )
}
