import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { calcAverageGrade, calcGPA } from '@/utils'
import { Grade } from '@prisma/client'

export default function GradeAverage({
  semester1,
  semester2
}: {
  semester1: Grade[]
  semester2: Grade[]
}) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-nowrap">Дүнгийн дундаж</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-4 grid-flow-col">
          <div>
            <Label className="text-nowrap">1-р хагас жилийн дундаж</Label>
            <p className="text-lg md:text-xl font-bold text-nowrap">
              {semester1.length === 0
                ? 'Дүн гараагүй'
                : `${calcAverageGrade(semester1)}% (GPA ${calcGPA(semester1)})`}
            </p>
          </div>
          <div>
            <Label className="text-nowrap">2-р хагас жилийн дундаж</Label>
            <p className="text-lg md:text-xl font-bold text-nowrap">
              {semester2.length === 0
                ? 'Дүн гараагүй'
                : `${calcAverageGrade(semester2)}% (GPA ${calcGPA(semester2)})`}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
