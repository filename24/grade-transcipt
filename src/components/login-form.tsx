'use client'
import { cn } from '@/utils'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useActionState } from 'react'
import { login } from '@/app/(auth)/login/actions'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const [state, action, pending] = useActionState(login, undefined)

  if (state?.message) {
    toast.error(state.message)
  }
  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Нэвтрэх</CardTitle>
          <CardDescription>Регистрийн дугаараа оруулна уу.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="registerNumber">Регистрын дугаар</Label>
                <Input
                  id="registerNumber"
                  name="registerNumber"
                  type="text"
                  placeholder="АБ12345678"
                  maxLength={10}
                  required
                />
                {state?.errors?.registerNumber && (
                  <p className="text-red-400 text-sm">
                    {state.errors.registerNumber}
                  </p>
                )}
              </div>
              <Button type="submit" disabled={pending} className="w-full">
                {pending ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Түр хүлээнэ үү...
                  </>
                ) : (
                  'Нэвтрэх'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
