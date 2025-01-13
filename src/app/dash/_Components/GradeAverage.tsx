import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { calcAverageGrade, calcGPA } from '@/utils'
import { getStudentGrade } from '@/utils/fetch'
import { Session } from 'next-auth'

export default async function GradeAverage({
  session
}: {
  session: Session | null
}) {
  const semester1Grade = await getStudentGrade(
    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain, @typescript-eslint/no-extra-non-null-assertion
    session?.user?.registerNumber!!,
    1
  )

  const semester2Grade = await getStudentGrade(
    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain, @typescript-eslint/no-extra-non-null-assertion
    session?.user?.registerNumber!!,
    2
  )

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
