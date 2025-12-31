'use client'

import type { Student } from '@gt/esis'
import { FileSpreadsheet, Search, User } from 'lucide-react'
import localFont from 'next/font/local'
import { useState } from 'react'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'

import { AppSidebarHeader } from '@/app/(sidebar)/_Components/Header'
import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import type { StudentGradeRecord } from '@/utils/fetch'

import { fetchStudentGradesAction, searchStudentAction } from './actions'

interface GroupedSubject {
  id: number
  code: string
  name: string
  isCompulsory: boolean
  grades: Record<number, { point: number; grade: string }>
}

interface ProcessedData {
  headers: string[]
  subHeaders: string[]
  rows: (string | number)[][]
  merges: XLSX.Range[]
  cols: XLSX.ColInfo[]
}

interface YearOption {
  value: string
  label: string
}

const mongolFont = localFont({
  src: '../../../../../../public/fonts/cmdashitseden.ttf',
  display: 'swap',
  variable: '--font-mongol' // 필요한 경우 Tailwind 변수로 사용 가능
})

export default function GradeExportPage() {
  const [registerNumber, setRegisterNumber] = useState('')
  const [student, setStudent] = useState<Student | undefined>(undefined)
  const [preview, setPreview] = useState<ProcessedData | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [startYear, setStartYear] = useState('2022')
  const [endYear, setEndYear] = useState('2025')

  const getYearOptions = (): YearOption[] => {
    if (!student?.ACADEMIC_YEAR || !student?.ACADEMIC_LEVEL) {
      return Array.from({ length: 16 }, (_, i) => {
        const year = (2015 + i).toString()
        return { value: year, label: `${year}-${Number(year) + 1}` }
      })
    }

    const currentYear = Number.parseInt(student.ACADEMIC_YEAR, 10)
    const currentLevel = Number.parseInt(student.ACADEMIC_LEVEL, 10)
    const validYears: YearOption[] = []

    for (let level = 1; level <= 12; level++) {
      const year = currentYear - (currentLevel - level)
      const yearStr = year.toString()

      validYears.push({
        value: yearStr,
        label: `${year}-${year + 1} хичээлийн жил (${level}-р анги)`
      })
    }

    return validYears.sort(
      (a, b) => Number.parseInt(a.value) - Number.parseInt(b.value)
    )
  }

  const processGradeData = (
    records: StudentGradeRecord[]
  ): ProcessedData | null => {
    if (!records || records.length === 0) return null

    const uniqueLevels = Array.from(
      new Set(records.map((r) => Number.parseInt(r.academicLevel)))
    ).sort((a, b) => a - b)

    const groupedSubjects: Record<string, GroupedSubject> = {}

    records.forEach((r) => {
      const level = Number.parseInt(r.academicLevel)
      const groupKey = `${r.classCode}_${r.isCompulsory ? 'comp' : 'elec'}`

      if (!groupedSubjects[groupKey]) {
        groupedSubjects[groupKey] = {
          id: r.id,
          code: r.classCode,
          name: r.className,
          isCompulsory: r.isCompulsory,
          grades: {}
        }
      }
      groupedSubjects[groupKey].grades[level] = {
        point: r.point,
        grade: r.grade
      }
    })

    const sortedSubjects = Object.values(groupedSubjects).sort((a, b) => {
      if (a.isCompulsory !== b.isCompulsory) {
        return a.isCompulsory ? -1 : 1
      }
      return a.id - b.id
    })

    const headers = ['Хичээлийн нэр']
    const subHeaders = ['']
    const merges: XLSX.Range[] = [{ s: { r: 0, c: 0 }, e: { r: 1, c: 0 } }]
    const cols: XLSX.ColInfo[] = [{ wch: 30 }]

    uniqueLevels.forEach((level, idx) => {
      headers.push(`${level}-р анги`, '')
      subHeaders.push('Дүн', 'Үнэлгээ')

      const startCol = 1 + idx * 2
      merges.push({ s: { r: 0, c: startCol }, e: { r: 0, c: startCol + 1 } })
      cols.push({ wch: 6 }, { wch: 6 })
    })

    const rows: (string | number)[][] = []

    sortedSubjects.forEach((subj) => {
      const row: (string | number)[] = [subj.name]

      uniqueLevels.forEach((level) => {
        const info = subj.grades[level]
        if (info) {
          row.push(info.point, info.grade)
        } else {
          row.push('', '')
        }
      })
      rows.push(row)
    })

    return { headers, subHeaders, rows, merges, cols }
  }

  const handleSearch = async () => {
    if (!registerNumber) {
      toast.warning('Регистрийн дугаараа оруулна уу.')
      return
    }
    setLoading(true)
    const res = await searchStudentAction(registerNumber)
    setLoading(false)

    if (!res.success || !res.data) {
      toast.error(res.error || 'Сурагч олдсонгүй.')
      return
    }

    setStudent(res.data)
    setPreview(undefined)
  }

  const handleFetchGrades = async () => {
    if (!student?.PERSON_ID) return

    setLoading(true)
    const res = await fetchStudentGradesAction(
      String(student.PERSON_ID),
      startYear,
      endYear
    )
    setLoading(false)

    if (!res.success || !res.data) {
      toast.error(res.error)
      return
    }

    const processed = processGradeData(res.data as StudentGradeRecord[])
    if (processed) {
      setPreview(processed)
      toast.success('Дүнгийн мэдээлэл амжилттай татагдлаа.')
    } else {
      toast.error('출력할 데이터가 없습니다.')
    }
  }

  const handleDownloadExcel = () => {
    if (!preview || !student) return

    const excelData = [preview.headers, preview.subHeaders, ...preview.rows]
    const worksheet = XLSX.utils.aoa_to_sheet(excelData)

    worksheet['!merges'] = preview.merges
    worksheet['!cols'] = preview.cols

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transcript')

    const lastInitial = student.LAST_NAME?.charAt(0).toUpperCase() || ''
    const filename = `transcript-${lastInitial}.${student.FIRST_NAME}-${startYear}-${endYear}.xlsx`

    XLSX.writeFile(workbook, filename)
  }

  const yearOptions = getYearOptions()

  return (
    <>
      <AppSidebarHeader>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Grade</BreadcrumbPage>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Export</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </AppSidebarHeader>

      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="font-bold text-2xl tracking-tight">
            Дүнгийн жагсаалт (성적 출력)
          </h1>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Search className="h-4 w-4" />
                  Сурагч хайх
                </CardTitle>
                <CardDescription>Регистрийн дугаараар хайх</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    id="registerNumber"
                    name="registerNumber"
                    placeholder="Жишээ: АБ00010151"
                    value={registerNumber}
                    onChange={(e) => setRegisterNumber(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button onClick={handleSearch} disabled={loading}>
                    {loading ? '...' : 'Хайх'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {student && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-4 w-4" />
                    Сурагчийн мэдээлэл
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex min-h-[140px] flex-row items-start justify-between">
                    {/* [좌측] 기본 정보 (키릴 문자) */}
                    <div className="flex flex-1 flex-col space-y-4 py-2">
                      <div className="flex max-w-11/12 items-center justify-between">
                        <span className="text-muted-foreground text-sm">
                          Овог нэр:
                        </span>
                        <span className="font-semibold text-sm">
                          {student.LAST_NAME} {student.FIRST_NAME}
                        </span>
                      </div>
                      <div className="flex max-w-11/12 items-center justify-between">
                        <span className="text-muted-foreground text-sm">
                          Регистрийн дугаар:
                        </span>
                        <span className="font-semibold text-sm">
                          {student.REGISTER}
                        </span>
                      </div>
                      <div className="flex max-w-11/12 items-center justify-between">
                        <span className="text-muted-foreground text-sm">
                          Анги:
                        </span>
                        <span className="font-semibold text-sm">
                          {student.ACADEMIC_LEVEL_NAME}
                        </span>
                      </div>
                      <div className="flex max-w-11/12 items-center justify-between">
                        <span className="text-muted-foreground text-sm">
                          Сургуулийн нэр:
                        </span>
                        <span className="text-right font-semibold text-sm">
                          {student.INSTITUTION_NAME}
                        </span>
                      </div>
                    </div>

                    {/* [우측] 몽골어 전통 문자 (폰트 적용 및 성/이름 분리) */}
                    {(student.FIRST_NAME_MGL || student.LAST_NAME_MGL) && (
                      <div className="flex h-full items-start gap-4 px-4">
                        {/* 성 (Last Name) */}
                        {student.LAST_NAME_MGL && (
                          <div
                            className={`${mongolFont.className} foreground/80 select-none text-xl leading-none`}
                            style={{
                              writingMode: 'vertical-lr',
                              textOrientation: 'mixed'
                            }}
                          >
                            {student.LAST_NAME_MGL}
                          </div>
                        )}

                        {/* 이름 (First Name) */}
                        {student.FIRST_NAME_MGL && (
                          <div
                            className={`${mongolFont.className} foreground select-none text-xl leading-none`}
                            style={{
                              writingMode: 'vertical-lr',
                              textOrientation: 'mixed'
                            }}
                          >
                            {student.FIRST_NAME_MGL}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm">
                      Хугацаа сонгох (기간 선택)
                    </h4>
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <span className="text-muted-foreground text-xs">
                          Эхлэх он
                        </span>
                        <Select value={startYear} onValueChange={setStartYear}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {yearOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <span className="text-muted-foreground text-xs">
                          Дуусах он
                        </span>
                        <Select value={endYear} onValueChange={setEndYear}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {yearOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button
                      className="w-full"
                      onClick={handleFetchGrades}
                      disabled={loading}
                    >
                      Дүн татах (성적 조회)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-8">
            <Card className="flex h-full min-h-[500px] flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileSpreadsheet className="h-4 w-4" />
                    Урьдчилан харах
                  </CardTitle>
                  <CardDescription>
                    Excel файл татахаас өмнө шалгах
                  </CardDescription>
                </div>
                {preview && (
                  <Button variant="default" onClick={handleDownloadExcel}>
                    Excel татах (.xlsx)
                  </Button>
                )}
              </CardHeader>
              <CardContent className="flex-1">
                {preview ? (
                  <div className="max-h-[700px] overflow-auto rounded-md border">
                    <Table>
                      <TableHeader className="sticky top-0 z-10 bg-muted/50 shadow-sm">
                        <TableRow>
                          {preview.headers.map((h, i) => {
                            if (h === '') return null
                            const colSpan = i === 0 ? 1 : 2
                            return (
                              <TableHead
                                key={i}
                                colSpan={colSpan}
                                className="h-10 border-r bg-muted/90 text-center font-bold"
                              >
                                {h}
                              </TableHead>
                            )
                          })}
                        </TableRow>
                        <TableRow>
                          {preview.subHeaders.map((h, i) => {
                            if (h === '')
                              return (
                                <TableHead
                                  key={i}
                                  className="border-r bg-muted/50 p-0"
                                />
                              )
                            return (
                              <TableHead
                                key={i}
                                className="h-8 border-r bg-muted/50 text-center text-xs"
                              >
                                {h}
                              </TableHead>
                            )
                          })}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {preview.rows.map((row, rIdx) => (
                          <TableRow key={rIdx} className="hover:bg-muted/50">
                            {row.map((cell, cIdx) => (
                              <TableCell
                                key={cIdx}
                                className="whitespace-nowrap border-r p-2 text-center last:border-r-0"
                              >
                                {cell}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/10 text-muted-foreground">
                    <FileSpreadsheet className="mb-4 h-12 w-12 opacity-20" />
                    <p className="font-medium text-lg">
                      Мэдээлэл сонгоогүй байна
                    </p>
                    <p className="text-sm">
                      Зүүн талын цонхноос сурагч хайж, хугацааг сонгоно уу.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
