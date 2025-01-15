'use client'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart'
import { resolveClassCode } from '@/utils'
import { Grade } from '@prisma/client'
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts'

export default function Top5GradeChart({
  semester1,
  semester2
}: {
  semester1: Grade[]
  semester2: Grade[]
}) {
  const topFiveSemester1 = semester1.slice(0, 5)
  const topFiveSemester2 = semester2.slice(0, 5)

  const topFiveGrade =
    topFiveSemester2.length === 0 ? topFiveSemester1 : topFiveSemester2
  const gradeChartConfig = Object.assign(
    {},
    ...topFiveGrade.map((grade) => {
      const classCode = resolveClassCode(grade.classCode)
      return {
        [classCode]: {
          label: classCode
        }
      }
    })
  )

  const chartData = topFiveGrade.map((grade, index) => {
    const classCode = resolveClassCode(grade.classCode)

    return {
      className: classCode,
      point: grade.point,
      fill: `hsl(var(--chart-${index + 1}))`
    }
  })
  const chartConfig: ChartConfig = {
    point: {
      label: 'Дүн'
    },
    ...gradeChartConfig
  }

  return (
    <Card className="col-span-full md:col-span-1">
      <CardHeader>
        <CardTitle>Хамгийн өндөр 5 дүн</CardTitle>
        <CardDescription>
          {topFiveSemester1.length === 0
            ? '2-р хагас жилийн дүнгийн мэдээлэлээр өндөр дүн тооцоолов.'
            : '1-р хагас жилийн дүнгийн мэдээлэлээр өндөр дүн тооцоолов.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              left: 0
            }}
          >
            <CartesianGrid vertical={false} />
            <YAxis
              dataKey="className"
              type="category"
              tickLine={false}
              tickMargin={-3}
              axisLine={false}
              tickFormatter={(value: keyof typeof chartConfig) =>
                chartConfig[value].label as string
              }
              hide
            />
            <XAxis
              dataKey="point"
              type="number"
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Bar dataKey="point" layout="vertical" radius={7} barSize={30}>
              <LabelList
                dataKey="className"
                position="insideLeft"
                offset={8}
                className="fill-accent-foreground"
                fontSize={12}
              />
              <LabelList
                dataKey="point"
                position="right"
                offset={8}
                className="fill-foreground"
                fontSize={10}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
