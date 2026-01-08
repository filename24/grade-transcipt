'use client'

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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

      if (result && 'error' in result && result.error) {
        const errorObj = result.error as { message?: string }
        setError(errorObj.message || '비밀번호 설정 실패')
        return
      }

      toast.success('Нууц үг амжилттай тохирууллаа!')
      setPassword('')
      setConfirmPassword('')
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      console.error('Password setup error:', err)
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
            Бүртгэлээ аюулгүй болгохын тулд нууц үг тохируулна уу. Passkey
            ашиглахын тулд нууц үг шаардлагатай.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">Шинэ нууц үг</Label>
            <Input
              id="new-password"
              type="password"
              placeholder="Хамгийн багадаа 8 тэмдэгт"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
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
              disabled={isLoading}
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="ghost"
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
