import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { calcAverageGrade, calcGPA } from '@/utils'
import { getStudentGrade } from '@/utils/fetch'
import { Session } from 'next-auth'
import { redirect } from 'next/navigation'

export default async function GradeAverage({
  session
}: {
  session: Session | null
}) {
  if (!session?.user?.name) {
    return redirect('/login')
  }
  const semester1Grade = await getStudentGrade(session.user.name, 1)

  const semester2Grade = await getStudentGrade(session.user.name, 2)

  return (
    <Card className="w-min">
      <CardHeader>
        <CardTitle className="text-nowrap">Дүнгийн дундаж</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-4">
          <div>
            <Label className="text-nowrap">1-р хагас жилийн дундаж</Label>
            <p className="text-lg md:text-xl font-bold text-nowrap">
              {semester1Grade.length === 0
                ? 'Дүн гараагүй'
                : `${calcAverageGrade(semester1Grade)}% (GPA ${calcGPA(
                    semester1Grade
                  )})`}
            </p>
          </div>
          <div>
            <Label className="text-nowrap">2-р хагас жилийн дундаж</Label>
            <p className="text-lg md:text-xl font-bold text-nowrap">
              {semester2Grade.length === 0
                ? 'Дүн гараагүй'
                : `${calcAverageGrade(semester2Grade)}% (GPA ${calcGPA(
                    semester2Grade
                  )})`}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
