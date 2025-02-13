'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { calcAverageGrade, calcGPA } from '@/utils'
import type { Grade } from '@prisma/client'

export default function GradeAverage({
  semester1,
  semester2
}: {
  semester1: Grade[]
  semester2: Grade[]
}) {
  const academicYear = `${semester1[0].academicYear}-${Number(semester1[0].academicYear) + 1}`

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-nowrap">Дүнгийн дундаж</CardTitle>
        {semester1.length === 0 ? undefined : (
          <CardDescription>
            {academicYear} хичээлийн жилийн дүнгийн дундаж
          </CardDescription>
        )}
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
                  {calcAverageGrade(semester1)}% (GPA {calcGPA(semester1)}/4.0)
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
                  {calcAverageGrade(semester2)}% (GPA {calcGPA(semester2)}/4.0)
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
