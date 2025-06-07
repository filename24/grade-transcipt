'use client'
import { useActionState, useState } from 'react'
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
>

export default function GradeTable() {
  const [data, setData] = useState<GradeData[]>([...generateEmptyData(42)])
  const [state, action, pending] = useActionState(createGrades, undefined)

  if (state?.message) {
    toast.success(state.message)
  }

  if (state?.errors?.message) {
    toast.error(state.errors.message)
  }

  console.log(data)
  return (
    <form
      action={() => {
        action(data)
      }}
    >
      <div className="mb-4 flex flex-row justify-start">
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
          className="ml-2 w-fit"
          onClick={() => {
            setData([...generateEmptyData(42)])
          }}
        >
          Reset
        </Button>
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

function generateEmptyData(rows: number): GradeData[] {
  return Array.from({ length: rows }, () => ({
    displayName: '',
    registerNumber: '',
    classCode: '',
    classGrade: '11а',
    point: 0,
    grade: ''
  }))
}
