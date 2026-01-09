'use client'

import * as React from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { authClient } from '@/utils/auth-client'

interface BanUserDialogProps {
  userId: string
  userName: string
  onSuccess: () => void
  children: React.ReactNode
}

export function BanUserDialog({
  userId,
  userName,
  onSuccess,
  children
}: BanUserDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [banReason, setBanReason] = React.useState('')
  const [banDuration, setBanDuration] = React.useState('permanent')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!banReason.trim()) {
      toast.error('Please enter a ban reason')
      return
    }

    setIsLoading(true)

    const durationMap: Record<string, number | undefined> = {
      permanent: undefined,
      '1d': 60 * 60 * 24,
      '7d': 60 * 60 * 24 * 7,
      '30d': 60 * 60 * 24 * 30
    }

    const result = await authClient.admin.banUser({
      userId,
      banReason,
      banExpiresIn: durationMap[banDuration]
    })

    if (result.error) {
      toast.error(result.error.message)
    } else {
      toast.success(`${userName} has been banned`)
      setOpen(false)
      setBanReason('')
      setBanDuration('permanent')
      onSuccess()
    }
    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ban User</DialogTitle>
          <DialogDescription>
            Ban {userName} from accessing the application.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reason">Reason</Label>
              <Input
                id="reason"
                placeholder="Enter ban reason..."
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="duration">Duration</Label>
              <Select value={banDuration} onValueChange={setBanDuration}>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="permanent">Permanent</SelectItem>
                  <SelectItem value="1d">1 Day</SelectItem>
                  <SelectItem value="7d">7 Days</SelectItem>
                  <SelectItem value="30d">30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Banning...
                </>
              ) : (
                'Ban User'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
