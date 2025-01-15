import { ChartConfig } from '@/components/ui/chart'
import { Grade } from '@prisma/client'

export default function GradePieChart({
  _semester1,
  _semester2
}: {
  _semester1: Grade[]
  _semester2: Grade[]
}) {
  const gradeChartConfig = Object.assign(
    {},
    ...['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'].map((grade) => {
      return {
        [grade]: {
          label: grade
        }
      }
    })
  )

  const _chartConfig: ChartConfig = {
    point: {
      label: 'Дүн'
    },
    ...gradeChartConfig
  }
}
