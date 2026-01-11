'use client'

import * as Sentry from '@sentry/nextjs'
import { Loader2, Shield } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/ui/password-input'
import { authClient } from '@/utils/auth-client'

interface PasswordSetupModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export default function PasswordSetupModal({
  open,
  onOpenChange,
  onSuccess
}: PasswordSetupModalProps) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Нууц үг хамгийн багадаа 8 тэмдэгт байх ёстой.')
      return
    }

    if (password !== confirmPassword) {
      setError('Нууц үг таарахгүй байна.')
      return
    }

    setIsLoading(true)
    try {
      const result = await authClient.setPassword({
        password,
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
      setPassword('')
      setConfirmPassword('')
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      Sentry.captureException(err, {
        level: 'warning',
        tags: { feature: 'password-setup', operation: 'set-password' }
      })
      setError('Нууц үг тохируулахад алдаа гарлаа.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = () => {
    toast.info('Нууц үгийг дараа профайл хуудсанд тохируулах боломжтой.')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Нууц үг тохируулах
          </DialogTitle>
          <DialogDescription>
            Таны мэдээллийн аюулгүй байдал бидэнд чухал тул та нууц үгээ
            тохируулаарай. Хэрэв хүсвэл дараа нь тохируулж болно.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">Шинэ нууц үг</Label>
            <PasswordInput
              id="new-password"
              placeholder="Хамгийн багадаа 8 үсэг"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
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
              disabled={isLoading}
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={handleSkip}
              disabled={isLoading}
            >
              Дараа тохируулах
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Түр хүлээнэ үү...
                </>
              ) : (
                'Тохируулах'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
