'use client'

import type { Grade } from '@gt/database/browser'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { getGradesByRegisterNumber } from '../actions'
import StudentGradeTable from './StudentGradeTable'

export default function StudentGradeSearch() {
  const [registerNumber, setRegisterNumber] = useState('')
  const [grades, setGrades] = useState<Grade[] | undefined>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async () => {
    if (!registerNumber.match(/^[А-Яа-я]{2}\d{8}$/i)) {
      toast.error('올바른 형식이 아닙니다 (예: АБ12345678)')
      return
    }

    setLoading(true)
    try {
      const result = await getGradesByRegisterNumber(
        registerNumber.toLowerCase()
      )
      if (result.success) {
        console.log(result)
        setGrades(result.data)
        setSearched(true)
        toast.success(`${result.data?.length}개의 성적을 찾았습니다`)
      } else {
        toast.error(result.error || '성적 조회 중 오류가 발생했습니다')
      }
    } catch (_) {
      toast.error('성적 조회 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6 flex gap-2">
        <Input
          placeholder="주민등록번호 (예: АБ12345678)"
          id="registerNumber"
          key="registerNumber"
          value={registerNumber}
          onChange={(e) => setRegisterNumber(e.target.value)}
          className="max-w-xs"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch()
            }
          }}
        />
        <Button onClick={handleSearch} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          검색
        </Button>
      </div>

      {searched && grades?.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">
          성적 데이터가 없습니다
        </div>
      )}

      {grades && <StudentGradeTable data={grades} onUpdate={handleSearch} />}
    </div>
  )
}
