'use client'

import * as Sentry from '@sentry/nextjs'
import { Loader2, LogOut, Monitor, Smartphone, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { parseUserAgent } from '@/utils'
import { authClient } from '@/utils/auth-client'

interface Session {
  id: string
  token: string
  userId: string
  expiresAt: Date
  ipAddress?: string
  userAgent?: string
  createdAt: Date
}

export default function SessionManager() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [revokingToken, setRevokingToken] = useState<string | null>(null)
  const [isRevokingOthers, setIsRevokingOthers] = useState(false)
  const [currentSessionToken, setCurrentSessionToken] = useState<string | null>(
    null
  )
  const router = useRouter()

  const fetchSessions = async () => {
    try {
      const result = await authClient.listSessions()
      const currentSession = await authClient.getSession()

      if (result.data) {
        setSessions(result.data as Session[])
      }

      if (currentSession.data?.session) {
        setCurrentSessionToken(currentSession.data.session.token)
      }
    } catch (error) {
      Sentry.captureException(error, {
        level: 'warning',
        tags: { feature: 'session-manager', operation: 'fetch' }
      })
    } finally {
      setIsLoading(false)
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: 새션 불러오는 작업
  useEffect(() => {
    fetchSessions()
  }, [])

  const handleRevokeSession = async (token: string) => {
    const isCurrentSession = token === currentSessionToken

    setRevokingToken(token)
    try {
      const result = await authClient.revokeSession({ token })

      if (result?.error) {
        const errorMsg =
          typeof result.error === 'object' && 'message' in result.error
            ? result.error.message
            : 'Тус хандалтыг устгахад алдаа гарлаа.'
        toast.error(errorMsg)
        return
      }

      toast.success('Тус хандалтыг амжилттай устгагдлаа!')

      if (isCurrentSession) {
        // Current session was revoked, redirect to login
        router.push('/login')
      } else {
        // Refresh sessions list
        setSessions(sessions.filter((s) => s.token !== token))
      }
    } catch (error) {
      Sentry.captureException(error, {
        level: 'warning',
        tags: { feature: 'session-manager', operation: 'revoke' }
      })
      toast.error('Тус хандалтыг устгахад алдаа гарлаа.')
    } finally {
      setRevokingToken(null)
    }
  }

  const handleRevokeOtherSessions = async () => {
    setIsRevokingOthers(true)
    try {
      const result = await authClient.revokeOtherSessions()

      if (result?.error) {
        const errorMsg =
          typeof result.error === 'object' && 'message' in result.error
            ? result.error.message
            : 'Бусад хандалт устгахад алдаа гарлаа.'
        toast.error(errorMsg)
        return
      }

      toast.success('Бусад бүх хандалт амжилттай устгагдлаа!')
      // Keep only current session
      setSessions(sessions.filter((s) => s.token === currentSessionToken))
    } catch (error) {
      Sentry.captureException(error, {
        level: 'warning',
        tags: { feature: 'session-manager', operation: 'revoke-others' }
      })
      toast.error('Бусад хандалт устгахад алдаа гарлаа.')
    } finally {
      setIsRevokingOthers(false)
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('mn-MN', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(new Date(date))
  }

  const otherSessions = sessions.filter((s) => s.token !== currentSessionToken)

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Monitor className="h-5 w-5" />
              Нэвтэрсэн төхөөрөмжүүд
            </CardTitle>
            <CardDescription>
              Таны бүртгэлд нэвтэрсэн бүх төхөөрөмжийг харах боломжтой.
            </CardDescription>
          </div>
          {otherSessions.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isRevokingOthers}
                  className="w-full sm:w-auto"
                >
                  {isRevokingOthers ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Түр хүлээнэ үү...
                    </>
                  ) : (
                    <>
                      <LogOut className="mr-2 h-4 w-4" />
                      Бусад төхөөрөмжөөс гаргах
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Бусад төхөөрөмжөөс гарах уу?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Таны бүртгэлд нэвтэрсэн бусад бүх төхөөрөмжөөс гарна. Энэ
                    төхөөрөмж дээрх хандалт хэвээр үлдэнэ.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Цуцлах</AlertDialogCancel>
                  <AlertDialogAction onClick={handleRevokeOtherSessions}>
                    Гарах
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : sessions.length === 0 ? (
          <p className="py-4 text-center text-muted-foreground text-sm">
            Идэвхтэй хандалт байхгүй байна.
          </p>
        ) : (
          <div className="max-h-[300px] space-y-2 overflow-y-auto">
            {sessions.map((session) => {
              const { browser, os, deviceType } = parseUserAgent(
                session.userAgent
              )
              const isCurrentSession = session.token === currentSessionToken
              const DeviceIcon = deviceType === 'mobile' ? Smartphone : Monitor

              return (
                <div
                  key={session.id}
                  className="flex items-start justify-between gap-2 rounded-lg border p-3"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
                    <DeviceIcon className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                        <p className="truncate font-medium text-sm">
                          {browser} - {os}
                        </p>
                        {isCurrentSession && (
                          <span className="shrink-0 rounded bg-primary/10 px-2 py-0.5 font-medium text-primary text-xs">
                            Энэ төхөөрөмж
                          </span>
                        )}
                      </div>
                      <p className="truncate text-muted-foreground text-xs">
                        {session.ipAddress && `${session.ipAddress} • `}
                        {formatDate(session.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={revokingToken === session.token}
                        >
                          {revokingToken === session.token ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-destructive" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {isCurrentSession
                              ? 'Гарах уу?'
                              : 'Төхөөрөмжийг салгах уу?'}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {isCurrentSession
                              ? 'Энэ төхөөрөмжөөс гарна. Дахин нэвтрэх шаардлагатай болно.'
                              : `"${browser} - ${os}" төхөөрөмжийн хандалтийг устгахдаа итгэлтэй байна уу? Тухайн төхөөрөмжөөс автоматаар гарна.`}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Цуцлах</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRevokeSession(session.token)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {isCurrentSession ? 'Гарах' : 'Салгах'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
