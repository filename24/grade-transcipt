import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { calcAverageGrade, calcGPA } from '@/utils'
import type { Grade } from '@prisma/client'
import NumberFlow from '@number-flow/react'

export default function GradeAverage({
  semester1,
  semester2,
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
        <div className="grid w-full grid-flow-col items-center gap-4">
          <div>
            <Label className="text-nowrap">1-р хагас жилийн дундаж</Label>
            <p className="text-nowrap font-bold text-lg md:text-xl">
              {semester1.length === 0 ? (
                'Дүн гараагүй'
              ) : (
                <>
                  <NumberFlow value={calcAverageGrade(semester1)} suffix="%" />{' '}
                  (GPA {calcGPA(semester1)})
                </>
              )}
            </p>

            {semester1.length === 0 ? undefined : (
              <CardDescription className="text-xs">
                {semester1.length === 20
                  ? 'Бүх хичээлийн дүн гарж дууссан байна.'
                  : `Одоогоор ${semester1.length} хичээлийн дүн гарсан байна.`}
              </CardDescription>
            )}
          </div>
          <div>
            <Label className="text-nowrap">2-р хагас жилийн дундаж</Label>
            <p className="text-nowrap font-bold text-lg md:text-xl">
              {semester2.length === 0 ? (
                'Дүн гараагүй'
              ) : (
                <>
                  <NumberFlow value={calcAverageGrade(semester2)} suffix="%" />{' '}
                  (GPA {calcGPA(semester2)})
                </>
              )}
            </p>
            {semester2.length === 0 ? undefined : (
              <CardDescription className="text-xs">
                {semester2.length === 20
                  ? 'Бүх хичээлийн дүн гарж дууссан байна.'
                  : `Одоогоор ${semester2.length} хичээлийн дүн гарсан байна.`}
              </CardDescription>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
