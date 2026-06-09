'use client'

import { Loader2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'

import { commitBulkUserInfo, previewBulkUserInfo } from '../actions'
import type { PreviewRow, PreviewStatus } from '../types'

const GENERIC_ERROR = 'Алдаа гарлаа. Дахин оролдоно уу.'

const STATUS_BADGE: Record<
  PreviewStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' }
> = {
  matched: { label: 'Олдсон', variant: 'default' },
  ambiguous: { label: 'Сонгох', variant: 'secondary' },
  not_found: { label: 'Олдсонгүй', variant: 'destructive' }
}

export function BulkInfoEditor() {
  const [fieldName, setFieldName] = useState('')
  const [raw, setRaw] = useState('')
  const [rows, setRows] = useState<PreviewRow[] | null>(null)
  // ambiguous 행에서 선택한 userId (index 기준)
  const [selections, setSelections] = useState<Record<number, string>>({})
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handlePreview = async () => {
    if (!fieldName.trim() || !raw.trim()) {
      toast.error('Талбарын нэр болон өгөгдлийг оруулна уу')
      return
    }
    setIsPreviewing(true)
    try {
      const result = await previewBulkUserInfo({ raw })
      if (!result.success) {
        toast.error(result.error)
        return
      }
      setRows(result.data)
      setSelections({})
    } catch {
      toast.error(GENERIC_ERROR)
    } finally {
      setIsPreviewing(false)
    }
  }

  // 저장 가능한 항목: matched(userId) 또는 사용자가 선택한 ambiguous 행
  const resolvedEntries = useMemo(
    () =>
      (rows ?? []).flatMap((row) => {
        const userId =
          row.status === 'matched' ? row.userId : selections[row.index]
        if (!userId) return []
        return [{ userId, data: row.data }]
      }),
    [rows, selections]
  )

  const handleSave = async () => {
    if (resolvedEntries.length === 0) {
      toast.error('Хадгалах боломжтой мөр алга байна')
      return
    }
    setIsSaving(true)
    try {
      const result = await commitBulkUserInfo({
        name: fieldName,
        entries: resolvedEntries
      })
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success(`${result.count} мөр хадгалагдлаа`)
      setRows(null)
      setRaw('')
      setSelections({})
    } catch {
      toast.error(GENERIC_ERROR)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-2">
        <Label htmlFor="field-name">Талбарын нэр</Label>
        <Input
          id="field-name"
          placeholder="ж: Элсэлтийн ерөнхий шалгалтын дугаар"
          value={fieldName}
          onChange={(e) => setFieldName(e.target.value)}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="bulk-data">Өгөгдөл (Excel-ээс хуулж тавина уу)</Label>
        <Textarea
          id="bulk-data"
          className="min-h-40 font-mono text-sm"
          placeholder={'Овог нэр\tутга\nОвог нэр\tутга'}
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
        />
        <p className="text-muted-foreground text-xs">
          Мөр бүрт: нэр, таб (эсвэл таслал), утга. Excel-ийн нүднүүдийг шууд
          хуулж болно.
        </p>
      </div>

      <Button onClick={handlePreview} disabled={isPreviewing}>
        {isPreviewing ? (
          <Loader2 className="animate-spin" />
        ) : (
          'Урьдчилан харах'
        )}
      </Button>

      {rows && (
        <div className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">#</TableHead>
                  <TableHead>Нэр</TableHead>
                  <TableHead>Утга</TableHead>
                  <TableHead>Төлөв</TableHead>
                  <TableHead>Сурагч</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => {
                  const badge = STATUS_BADGE[row.status]
                  return (
                    <TableRow key={row.index}>
                      <TableCell className="text-muted-foreground">
                        {row.index + 1}
                      </TableCell>
                      <TableCell>{row.rawName || '—'}</TableCell>
                      <TableCell>{row.data || '—'}</TableCell>
                      <TableCell>
                        <Badge variant={badge.variant}>{badge.label}</Badge>
                      </TableCell>
                      <TableCell>
                        {row.status === 'ambiguous' && row.candidates ? (
                          <Select
                            value={selections[row.index] ?? ''}
                            onValueChange={(value) =>
                              setSelections((prev) => ({
                                ...prev,
                                [row.index]: value
                              }))
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Сонгох…" />
                            </SelectTrigger>
                            <SelectContent>
                              {row.candidates.map((c) => (
                                <SelectItem key={c.id} value={c.id}>
                                  {c.name} ({c.registerNumber})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : row.status === 'matched' ? (
                          <span className="text-muted-foreground text-sm">
                            {row.rawName}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            —
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-sm">
              Хадгалах боломжтой: {resolvedEntries.length} / {rows.length}
            </p>
            <Button
              onClick={handleSave}
              disabled={isSaving || resolvedEntries.length === 0}
            >
              {isSaving ? <Loader2 className="animate-spin" /> : 'Хадгалах'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
