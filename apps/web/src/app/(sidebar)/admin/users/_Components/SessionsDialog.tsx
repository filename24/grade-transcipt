'use client'

import * as React from 'react'
import { Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { authClient } from '@/utils/auth-client'

interface Session {
  id: string
  token: string
  userAgent?: string | null
  ipAddress?: string | null
  createdAt: Date
  expiresAt: Date
}

interface SessionsDialogProps {
  userId: string
  userName: string
  children: React.ReactNode
}

export function SessionsDialog({
  userId,
  userName,
  children
}: SessionsDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [sessions, setSessions] = React.useState<Session[]>([])
  const [loading, setLoading] = React.useState(false)
  const [revoking, setRevoking] = React.useState<string | null>(null)

  const fetchSessions = React.useCallback(async () => {
    setLoading(true)
    try {
      const result = await authClient.admin.listUserSessions({ userId })
      if (result.data) {
        // API returns { sessions: [...] } or array directly
        const sessionsData = Array.isArray(result.data)
          ? result.data
          : (result.data as { sessions?: Session[] }).sessions || []
        setSessions(sessionsData as Session[])
      }
    } catch (error) {
      toast.error('Failed to fetch sessions')
    }
    setLoading(false)
  }, [userId])

  React.useEffect(() => {
    if (open) {
      fetchSessions()
    }
  }, [open, fetchSessions])

  const handleRevokeSession = async (sessionToken: string) => {
    setRevoking(sessionToken)
    const result = await authClient.admin.revokeUserSession({ sessionToken })
    if (result.error) {
      toast.error(result.error.message)
    } else {
      toast.success('Session revoked')
      fetchSessions()
    }
    setRevoking(null)
  }

  const handleRevokeAllSessions = async () => {
    setRevoking('all')
    const result = await authClient.admin.revokeUserSessions({ userId })
    if (result.error) {
      toast.error(result.error.message)
    } else {
      toast.success('All sessions revoked')
      fetchSessions()
    }
    setRevoking(null)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString()
  }

  const truncateUserAgent = (ua?: string | null) => {
    if (!ua) return '-'
    return ua.length > 50 ? `${ua.substring(0, 50)}...` : ua
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>User Sessions</DialogTitle>
          <DialogDescription>
            Manage sessions for {userName}
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end mb-4">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleRevokeAllSessions}
            disabled={revoking === 'all' || sessions.length === 0}
          >
            {revoking === 'all' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Revoking...
              </>
            ) : (
              'Revoke All Sessions'
            )}
          </Button>
        </div>

        <div className="rounded-md border max-h-[400px] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>IP Address</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className="w-[80px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                  </TableCell>
                </TableRow>
              ) : sessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No active sessions
                  </TableCell>
                </TableRow>
              ) : (
                sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>{session.ipAddress || '-'}</TableCell>
                    <TableCell
                      className="max-w-[200px] truncate"
                      title={session.userAgent || undefined}
                    >
                      {truncateUserAgent(session.userAgent)}
                    </TableCell>
                    <TableCell>{formatDate(session.createdAt)}</TableCell>
                    <TableCell>{formatDate(session.expiresAt)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRevokeSession(session.token)}
                        disabled={revoking === session.token}
                      >
                        {revoking === session.token ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-destructive" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  )
}
