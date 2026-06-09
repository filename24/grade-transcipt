'use client'

import { Loader2, Search } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { searchUsersByName } from '../actions'
import type { MatchCandidate } from '../types'
import { UserInfoEditor } from './UserInfoEditor'

const GENERIC_ERROR = 'Алдаа гарлаа. Дахин оролдоно уу.'

export function StudentInfoManager() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<MatchCandidate[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selected, setSelected] = useState<MatchCandidate | null>(null)

  const handleSearch = async () => {
    if (!query.trim()) return
    setIsSearching(true)
    try {
      const result = await searchUsersByName(query)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      setResults(result.data)
    } catch {
      toast.error(GENERIC_ERROR)
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end gap-2">
        <div className="grid flex-1 gap-2">
          <Label htmlFor="search">Сурагч хайх (нэрээр)</Label>
          <Input
            id="search"
            placeholder="Овог эсвэл нэр"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Button onClick={handleSearch} disabled={isSearching}>
          {isSearching ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Search className="size-4" />
          )}
        </Button>
      </div>

      {results.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {results.map((user) => (
            <Button
              key={user.id}
              variant={selected?.id === user.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelected(user)}
            >
              {user.name} ({user.registerNumber})
            </Button>
          ))}
        </div>
      )}

      {selected && (
        <div className="space-y-4 rounded-md border p-4">
          <h3 className="font-semibold">{selected.name} — нэмэлт мэдээлэл</h3>
          <UserInfoEditor key={selected.id} userId={selected.id} />
        </div>
      )}
    </div>
  )
}
