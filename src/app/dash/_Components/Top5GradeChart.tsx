'use client'
import {
  Card,
  CardContent,
  CardFooter,
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
  const _topFiveSemester2 = semester2.slice(0, 5)

  const gradeChartConfig = Object.assign(
    {},
    ...topFiveSemester1.map((grade) => {
      const classCode = resolveClassCode(grade.classCode)
      return {
        [classCode]: {
          label: classCode
        }
      }
    })
  )

  const chartData = topFiveSemester1.map((grade, index) => {
    const classCode = resolveClassCode(grade.classCode)

    return {
      className: classCode,
      grade: grade.grade,
      fill: `hsl(var(--chart-${index + 1}))`
    }
  })
  const chartConfig: ChartConfig = {
    grade: {
      label: 'Дүн'
    },
    ...gradeChartConfig
  }

  return (
    <Card className="col-span-full md:col-span-1">
      <CardHeader>
        <CardTitle>Хамгийн өндөр 5 дүн</CardTitle>
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
              dataKey="grade"
              type="number"
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Bar dataKey="grade" layout="vertical" radius={7} barSize={30}>
              <LabelList
                dataKey="className"
                position="insideLeft"
                offset={8}
                className="fill-accent-foreground"
                fontSize={12}
              />
              <LabelList
                dataKey="grade"
                position="right"
                offset={8}
                className="fill-foreground"
                fontSize={10}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  )
}
