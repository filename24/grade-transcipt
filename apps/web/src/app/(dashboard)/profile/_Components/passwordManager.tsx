'use client'

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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
      if (result && 'hasPassword' in result) {
        const status = result.hasPassword as boolean
        setHasPassword(status)
        onPasswordStatusChange?.(status)
      }
    } catch (err) {
      console.error('Failed to check password status:', err)
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

      if (result && 'error' in result && result.error) {
        const errorObj = result.error as { message?: string }
        setError(errorObj.message || '비밀번호 설정 실패')
        return
      }

      toast.success('Нууц үг амжилттай тохирууллаа!')
      setNewPassword('')
      setConfirmPassword('')
      setHasPassword(true)
      onPasswordStatusChange?.(true)
    } catch (err) {
      console.error('Password set error:', err)
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

      if (result && 'error' in result && result.error) {
        const errorObj = result.error as { message?: string }
        setError(errorObj.message || '비밀번호 변경 실패')
        return
      }

      toast.success('Нууц үг амжилттай солигдлоо!')
      setCurrentPassword('')
      setChangeNewPassword('')
      setChangeConfirmPassword('')
    } catch (err) {
      console.error('Password change error:', err)
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
              <Input
                id="new-password"
                type="password"
                placeholder="Хамгийн багадаа 8 тэмдэгт"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Нууц үг баталгаажуулах</Label>
              <Input
                id="confirm-password"
                type="password"
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
              <Input
                id="current-password"
                type="password"
                placeholder="Одоогийн нууц үгээ оруулна уу"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="change-new-password">Шинэ нууц үг</Label>
              <Input
                id="change-new-password"
                type="password"
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
              <Input
                id="change-confirm-password"
                type="password"
                placeholder="Шинэ нууц үгээ дахин оруулна уу"
                value={changeConfirmPassword}
                onChange={(e) => setChangeConfirmPassword(e.target.value)}
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
                'Нууц үг солих'
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
