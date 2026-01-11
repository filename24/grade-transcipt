'use client'

import * as Sentry from '@sentry/nextjs'
import { Key, Loader2, Shield } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/ui/password-input'
import { authClient } from '@/utils/auth-client'

interface PasswordManagerProps {
  onPasswordStatusChange?: (hasPassword: boolean) => void
}

export default function PasswordManager({
  onPasswordStatusChange
}: PasswordManagerProps) {
  const [hasPassword, setHasPassword] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Set password form
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Change password form
  const [currentPassword, setCurrentPassword] = useState('')
  const [changeNewPassword, setChangeNewPassword] = useState('')
  const [changeConfirmPassword, setChangeConfirmPassword] = useState('')

  const [error, setError] = useState('')

  const checkPasswordStatus = async () => {
    try {
      const result = await authClient.hasPassword()
      if (result.data && 'hasPassword' in result.data) {
        const status = result.data.hasPassword
        setHasPassword(status)
        onPasswordStatusChange?.(status)
      }
    } catch (err) {
      Sentry.captureException(err, {
        level: 'warning',
        tags: { feature: 'password-manager', operation: 'check-status' }
      })
    } finally {
      setIsLoading(false)
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: 컴포넌트 마운트 시에만 실행
  useEffect(() => {
    checkPasswordStatus()
  }, [])

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (newPassword.length < 8) {
      setError('Нууц үг хамгийн багадаа 8 тэмдэгт байх ёстой.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Нууц үг таарахгүй байна.')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await authClient.setPassword({
        password: newPassword,
        confirmPassword
      })

      if (result.data && 'error' in result.data) {
        const errorMsg =
          typeof result.data.error === 'string'
            ? result.data.error
            : 'Нууц үг тохируулахад алдаа гарлаа'
        setError(errorMsg)
        return
      }

      toast.success('Нууц үг амжилттай тохирууллаа!')
      setNewPassword('')
      setConfirmPassword('')
      setHasPassword(true)
      onPasswordStatusChange?.(true)
    } catch (err) {
      Sentry.captureException(err, {
        level: 'warning',
        tags: { feature: 'password-manager', operation: 'set-password' }
      })
      setError('Нууц үг тохируулахад алдаа гарлаа.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (changeNewPassword.length < 8) {
      setError('Шинэ нууц үг хамгийн багадаа 8 тэмдэгт байх ёстой.')
      return
    }

    if (changeNewPassword !== changeConfirmPassword) {
      setError('Шинэ нууц үг таарахгүй байна.')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await authClient.changePassword({
        currentPassword,
        newPassword: changeNewPassword,
        confirmPassword: changeConfirmPassword
      })

      if (result.data && 'error' in result.data) {
        const errorMsg =
          typeof result.data.error === 'string'
            ? result.data.error
            : 'Нууц үг солиход алдаа гарлаа'
        setError(errorMsg)
        return
      }

      toast.success('Нууц үг амжилттай солигдлоо!')
      setCurrentPassword('')
      setChangeNewPassword('')
      setChangeConfirmPassword('')
    } catch (err) {
      Sentry.captureException(err, {
        level: 'warning',
        tags: { feature: 'password-manager', operation: 'change-password' }
      })
      setError('Нууц үг солиход алдаа гарлаа.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Key className="h-5 w-5" />
          Нууц үг удирдлага
        </CardTitle>
        <CardDescription>
          {hasPassword
            ? 'Нууц үгээ солих эсвэл шинэчлэх боломжтой.'
            : 'Бүртгэлээ аюулгүй болгохын тулд нууц үг тохируулна уу.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasPassword ? (
          // Set password form
          <form onSubmit={handleSetPassword} className="space-y-4">
            <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950">
              <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <p className="text-amber-800 text-sm dark:text-amber-200">
                Passkey ашиглахын тулд нууц үг тохируулах шаардлагатай.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">Шинэ нууц үг</Label>
              <PasswordInput
                id="new-password"
                placeholder="Хамгийн багадаа 8 тэмдэгт"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Нууц үг баталгаажуулах</Label>
              <PasswordInput
                id="confirm-password"
                placeholder="Нууц үгээ дахин оруулна уу"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Түр хүлээнэ үү...
                </>
              ) : (
                'Нууц үг тохируулах'
              )}
            </Button>
          </form>
        ) : (
          // Change password form
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Одоогийн нууц үг</Label>
              <PasswordInput
                id="current-password"
                placeholder="Одоогийн нууц үгээ оруулна уу"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="change-new-password">Шинэ нууц үг</Label>
              <PasswordInput
                id="change-new-password"
                placeholder="Хамгийн багадаа 8 тэмдэгт"
                value={changeNewPassword}
                onChange={(e) => setChangeNewPassword(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="change-confirm-password">
                Шинэ нууц үг баталгаажуулах
              </Label>
              <PasswordInput
                id="change-confirm-password"
                placeholder="Шинэ нууц үгээ дахин оруулна уу"
                value={changeConfirmPassword}
                onChange={(e) => setChangeConfirmPassword(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Түр хүлээнэ үү...
                </>
              ) : (
                'Нууц үг солих'
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
