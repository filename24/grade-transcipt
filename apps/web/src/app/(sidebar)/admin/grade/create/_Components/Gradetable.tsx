'use client'
import { useActionState, useEffect, useState } from 'react'
import { HotColumn, HotTable } from '@handsontable/react-wrapper'

import { Button } from '@/components/ui/button'
import {
  AutoColumnSize,
  Autofill,
  ContextMenu,
  CopyPaste,
  registerPlugin
} from 'handsontable/plugins'

import 'handsontable/styles/handsontable.min.css'
import 'handsontable/styles/ht-theme-main.min.css'
import { calculateGradeCode, SnowflakeId } from '@/utils'
import type { Grade } from '@gt/database'
import { NumericCellType, registerCellType } from 'handsontable/cellTypes'
import { toast } from 'sonner'
import { createGrades } from '../actions'
import { Loader2 } from 'lucide-react'
import type { GradeStatus } from '@gt/esis'

import { GradeConfigDialog } from './GradeConfigDialog'

registerCellType(NumericCellType)

registerPlugin(AutoColumnSize)
registerPlugin(Autofill)
registerPlugin(CopyPaste)
registerPlugin(ContextMenu)

export type GradeData = Pick<
  Grade,
  | 'classCode'
  | 'classGrade'
  | 'point'
  | 'registerNumber'
  | 'displayName'
  | 'grade'
  | 'status'
>

export type GradeConfig = Partial<
  Pick<GradeData, 'classGrade' | 'classCode'> & {
    status: keyof typeof GradeStatus
  }
>

export default function GradeTable() {
  const [state, action, pending] = useActionState(createGrades, undefined)
  const [config, setConfig] = useState<GradeConfig>({})
  const [data, setData] = useState<GradeData[]>([...generateEmptyData(42)])

  // biome-ignore lint/correctness/useExhaustiveDependencies: data 의존시 무한로프 돎
  useEffect(() => {
    setData(
      data.map((row) => ({
        ...row,
        // config에서 가져온 값들 업데이트
        classCode: config.classCode || row.classCode,
        classGrade: config.classGrade || row.classGrade,
        status: config.status || row.status,
        // point와 grade 리셋
        point: 0,
        grade: ''
      }))
    )
  }, [config])

  if (state?.message) {
    toast.success(state.message)
  }

  if (state?.errors?.message) {
    toast.error(state.errors.message)
  }

  return (
    <form
      action={() => {
        action(data)
      }}
    >
      <div className="mb-4 flex flex-row justify-start gap-4">
        <Button type="submit" disabled={pending} className="w-fit">
          {pending ? (
            <>
              <Loader2 className="animate-spin" />
              Түр хүлээнэ үү...
            </>
          ) : (
            'Дүн хадгалах'
          )}
        </Button>

        <Button
          type="button"
          className="w-fit"
          onClick={() => {
            setData([...generateEmptyData(42, config)])
          }}
        >
          Reset
        </Button>

        <GradeConfigDialog config={config} setConfig={setConfig} />
      </div>
      <HotTable
        themeName="ht-theme-main-dark-auto"
        data={data}
        rowHeaders={true}
        dataSchema={{
          displayName: null,
          registerNumber: null,
          classCode: null,
          classGrade: null,
          point: null,
          grade: null
        }}
        colHeaders={[
          'Нэр',
          'Регистын дугаар',
          'Хичээлын код',
          'Анги',
          'Дүн',
          'Түвшин'
        ]}
        columns={[
          {
            data: 'displayName'
          },
          {
            data: 'registerNumber'
          },
          {
            data: 'classCode'
          },
          {
            data: 'classGrade'
          },
          {
            data: 'point'
            // type: 'numberic'
          },
          {
            data: 'grade',
            readOnly: true
          }
        ]}
        contextMenu={true}
        licenseKey="non-commercial-and-evaluation"
        afterChange={(changes, source) => {
          if (source === 'edit' && changes) {
            setData(
              data.map((row) => {
                return {
                  ...row,
                  grade: calculateGradeCode(row.point)
                }
              })
            )
          }
        }}
        autoColumnSize={{ useHeaders: true }}
      />
    </form>
  )
}

function generateEmptyData(rows: number, config?: GradeConfig): GradeData[] {
  return Array.from({ length: rows }, () => ({
    displayName: '',
    registerNumber: '',
    classCode: config?.classCode || '',
    classGrade: config?.classGrade || '',
    point: 0,
    grade: '',
    status: config?.status || ''
  }))
}
