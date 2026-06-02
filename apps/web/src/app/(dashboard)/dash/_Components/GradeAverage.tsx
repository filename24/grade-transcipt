'use client'

import type { Grade } from '@gt/database/browser'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { calcAverageGrade, calcGPA } from '@/utils'
import { CURRECT_ACADEMIC_YEAR } from '@/utils/constants'

export default function GradeAverage({
  semester1,
  semester2,
  semester1Total,
  semester2Total
}: {
  semester1: Grade[]
  semester2: Grade[]
  // 같은 학년에서 성적이 입력된 전체 과목 수(분모). 0이면 아직 학년 과목 수를 알 수 없음.
  semester1Total: number
  semester2Total: number
}) {
  const ACADEMIC_YEAR = semester1[0]?.academicYear || CURRECT_ACADEMIC_YEAR
  const academicYear = `${ACADEMIC_YEAR}-${Number(ACADEMIC_YEAR) + 1}`

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-nowrap">Дүнгийн дундаж</CardTitle>
        <CardDescription>
          {academicYear} хичээлийн жилийн дүнгийн дундаж
        </CardDescription>
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
                {semester1Total > 0 && semester1.length >= semester1Total
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
                {semester2Total > 0 && semester2.length >= semester2Total
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
