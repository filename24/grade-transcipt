'use client'

import { Loader2 } from 'lucide-react'
import * as React from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
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

import type { UserData } from './UserTable'

interface UserDetailDialogProps {
  user: UserData
  onSuccess: () => void
  children: React.ReactNode
}

export function UserDetailDialog({
  user,
  onSuccess,
  children
}: UserDetailDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [name, setName] = React.useState(user.name)
  const [role, setRole] = React.useState(user.role)

  React.useEffect(() => {
    if (open) {
      setName(user.name)
      setRole(user.role)
    }
  }, [open, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Name is required')
      return
    }

    setIsLoading(true)

    try {
      // Update user name if changed
      if (name !== user.name) {
        await authClient.admin.updateUser({
          userId: user.id,
          data: { name }
        })
      }

      // Update role if changed
      if (role !== user.role) {
        await authClient.admin.setRole({
          userId: user.id,
          role: role as 'ADMIN' | 'TEACHER' | 'STUDENT'
        })
      }

      toast.success('User updated successfully')
      setOpen(false)
      onSuccess()
    } catch (error) {
      toast.error('Failed to update user')
    }

    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>View and edit user information</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">ID</Label>
              <div className="col-span-3 font-mono text-sm">{user.id}</div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Email</Label>
              <div className="col-span-3">{user.email}</div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Register #</Label>
              <div className="col-span-3">{user.registerNumber || '-'}</div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">System ID</Label>
              <div className="col-span-3 font-mono text-sm">
                {user.systemId || '-'}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                  <SelectItem value="TEACHER">TEACHER</SelectItem>
                  <SelectItem value="STUDENT">STUDENT</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Status</Label>
              <div className="col-span-3">
                {user.banned ? (
                  <div className="space-y-1">
                    <Badge variant="destructive">Banned</Badge>
                    {user.banReason && (
                      <p className="text-muted-foreground text-sm">
                        Reason: {user.banReason}
                      </p>
                    )}
                    {user.banExpires && (
                      <p className="text-muted-foreground text-sm">
                        Expires: {new Date(user.banExpires).toLocaleString()}
                      </p>
                    )}
                  </div>
                ) : (
                  <Badge variant="outline">Active</Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Created</Label>
              <div className="col-span-3 text-muted-foreground text-sm">
                {new Date(user.createdAt).toLocaleString()}
              </div>
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
