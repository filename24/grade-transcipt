'use client'

import { Check, Loader2, Pencil, Trash2, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

import {
  deleteUserInfo,
  listUserInfo,
  updateUserInfoById,
  upsertUserInfo
} from '../actions'
import type { InfoItem } from '../types'

const GENERIC_ERROR = 'Алдаа гарлаа. Дахин оролдоно уу.'

export function UserInfoEditor({ userId }: { userId: string }) {
  const [items, setItems] = useState<InfoItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const [newName, setNewName] = useState('')
  const [newData, setNewData] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  // 인라인 편집 상태
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editData, setEditData] = useState('')
  const [isSavingEdit, setIsSavingEdit] = useState(false)

  const [deletingId, setDeletingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await listUserInfo(userId)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      setItems(result.data)
    } catch {
      toast.error(GENERIC_ERROR)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    load()
  }, [load])

  const handleAdd = async () => {
    if (!newName.trim() || !newData.trim()) {
      toast.error('Нэр болон утгыг оруулна уу')
      return
    }
    setIsAdding(true)
    try {
      const result = await upsertUserInfo({
        userId,
        name: newName,
        data: newData
      })
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success('Хадгалагдлаа')
      setNewName('')
      setNewData('')
      await load()
    } catch {
      toast.error(GENERIC_ERROR)
    } finally {
      setIsAdding(false)
    }
  }

  const startEdit = (item: InfoItem) => {
    setEditingId(item.id)
    setEditName(item.name)
    setEditData(item.data)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditName('')
    setEditData('')
  }

  const saveEdit = async (id: string) => {
    if (!editName.trim() || !editData.trim()) {
      toast.error('Нэр болон утгыг оруулна уу')
      return
    }
    setIsSavingEdit(true)
    try {
      const result = await updateUserInfoById({
        id,
        name: editName,
        data: editData
      })
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success('Шинэчлэгдлээ')
      cancelEdit()
      await load()
    } catch {
      toast.error(GENERIC_ERROR)
    } finally {
      setIsSavingEdit(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (deletingId) return
    setDeletingId(id)
    try {
      const result = await deleteUserInfo(id)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success(result.message)
      setItems((prev) => prev.filter((item) => item.id !== id))
    } catch {
      toast.error(GENERIC_ERROR)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex h-24 items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Нэр</TableHead>
              <TableHead>Утга</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center text-muted-foreground"
                >
                  Мэдээлэл алга байна
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) =>
                editingId === item.id ? (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={editData}
                        onChange={(e) => setEditData(e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={isSavingEdit}
                          onClick={() => saveEdit(item.id)}
                          aria-label="Хадгалах"
                        >
                          {isSavingEdit ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Check className="size-4 text-green-600" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={isSavingEdit}
                          onClick={cancelEdit}
                          aria-label="Болих"
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.data}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={editingId !== null || deletingId !== null}
                          onClick={() => startEdit(item)}
                          aria-label="Засах"
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={
                            editingId !== null || deletingId === item.id
                          }
                          onClick={() => handleDelete(item.id)}
                          aria-label="Устгах"
                        >
                          {deletingId === item.id ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Trash2 className="size-4 text-destructive" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              )
            )}
          </TableBody>
        </Table>
      )}

      <div className="flex items-end gap-2 border-t pt-4">
        <div className="grid flex-1 gap-2">
          <Label htmlFor="new-name">Нэр</Label>
          <Input
            id="new-name"
            placeholder="ж: ЭЕШ-ийн дугаар"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
        </div>
        <div className="grid flex-1 gap-2">
          <Label htmlFor="new-data">Утга</Label>
          <Input
            id="new-data"
            value={newData}
            onChange={(e) => setNewData(e.target.value)}
          />
        </div>
        <Button onClick={handleAdd} disabled={isAdding}>
          {isAdding ? <Loader2 className="animate-spin" /> : 'Нэмэх'}
        </Button>
      </div>
    </div>
  )
}
