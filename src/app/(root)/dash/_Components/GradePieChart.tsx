'use client'
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
import type { Grade } from '@prisma/client'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { LabelList, Pie, PieChart } from 'recharts'

export default function GradePieChart({
  semester1,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  semester2
}: {
  semester1: Grade[]
  semester2: Grade[]
}) {
  const gradeChartConfig = Object.assign(
    {},
    ...grades.map((grade) => {
      return {
        [grade]: {
          label: grade
        }
      }
    })
  )

  const counts = countGrades(semester1)

  const chartData = grades
    .map((grade, index) => {
      if (counts[grade] === 0) return undefined

      return {
        grade: grade,
        count: counts[grade],
        fill: `hsl(var(--chart-${index + 1}))`
      }
    })
    .filter((grade) => !!grade)

  const chartConfig: ChartConfig = {
    point: {
      label: 'Дүн'
    },
    ...gradeChartConfig
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Нийт түвшин</CardTitle>
        <CardDescription>1-р хагас жил</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
            <Pie data={chartData} dataKey="count" nameKey="grade" label>
              <LabelList
                dataKey="grade"
                className="fill-foreground"
                stroke="none"
                fontSize={12}
                formatter={(value: keyof typeof chartConfig) =>
                  chartConfig[value]?.label
                }
              />
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="grade" />}
              className="-translate-y-2 [&>*]:basis-1/4 [&>*]:justify-center"
            />
          </PieChart>
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
