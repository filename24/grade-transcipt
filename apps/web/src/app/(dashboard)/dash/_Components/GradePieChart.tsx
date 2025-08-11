'use client'
import type { Grade } from '@gt/database'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart'
import { countGrades, grades } from '@/utils'

export default function GradePieChart({
  semester1,
  semester2
}: {
  semester1: Grade[]
  semester2: Grade[]
}) {
  // 등급별 개수 집계
  const semester1Counts = countGrades(semester1)
  const semester2Counts = countGrades(semester2)

  // semester1에 실제로 존재하는 등급만 추출
  const semester1Grades = grades.filter((grade) => semester1Counts[grade] > 0)

  // RadarChart용 데이터 생성 (semester1에 있는 등급만)
  const chartData = semester1Grades.map((grade) => ({
    grade,
    semester1Count: semester1Counts[grade] || 0,
    semester2Count: semester2Counts[grade] || 0
  }))

  // ChartConfig: 등급별 색상 및 라벨 지정
  const chartConfig: ChartConfig = {
    semester1Count: {
      label: '1-р хагас жил',
      color: 'hsl(var(--chart-1))'
    },
    semester2Count: {
      label: '2-р хагас жил',
      color: 'hsl(var(--chart-2))'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Хагас жилийн үнэлгээний харьцуулалт</CardTitle>
        <CardDescription>
          Хэрэв 2-р үнэлгээний харьцуулалт харагдахгүй бол аль нэг түвшин
          бүгдээрээ байгаа гэсэн үг. Мөн нэг хагас жилд бүх түвшин (I~VIII)
          байвал график тод харагдахгүй байж магадгүй.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[320px]"
        >
          <RadarChart data={chartData} margin={{ top: -40, bottom: -10 }}>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <PolarAngleAxis dataKey="grade" />
            <PolarGrid />
            <Radar
              dataKey="semester1Count"
              fill="var(--color-semester1Count)"
              fillOpacity={0.6}
            />
            <Radar
              dataKey="semester2Count"
              fill="var(--color-semester2Count)"
              fillOpacity={0.6}
            />
            <ChartLegend className="mt-8" content={<ChartLegendContent />} />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <Link
          href="/dash/grade"
          className="flex flex-row gap-1 text-center text-muted-foreground text-sm"
        >
          Дэлгэрэнгүй мэдээлэл харах <ArrowRight size={20} />
        </Link>
      </CardFooter>
    </Card>
  )
}
