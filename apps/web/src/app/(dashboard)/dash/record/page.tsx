import {
  getStudentAcademicYears,
  getStudentDataWithName,
  getStudentGradeRecords
} from '@/utils'
import { auth } from '@/utils/auth'
import { redirect } from 'next/navigation'
import RecordLayout from './_Components/RecordLayout'

export default async function RecordPage() {
  const session = await auth()

  if (!session?.user?.name) return redirect('/login')

  const userData = await getStudentDataWithName(session.user.name)

  if (!userData) return redirect('/login')

  const academicYears = await getStudentAcademicYears(userData.systemId)

  const studentRecords = await getStudentGradeRecords(userData.systemId, '0')
  return (
    <RecordLayout academicYears={academicYears} gradeRecords={studentRecords} />
  )
}
