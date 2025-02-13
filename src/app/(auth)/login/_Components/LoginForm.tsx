'use client'
import { cn } from '@/utils'
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
import { useActionState } from 'react'
import { loginWithEsis, loginWithRegister } from '@/app/(auth)/login/actions'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import RegisterUnknow from './RegisterDialog'

export function RegisterLoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const [state, action, pending] = useActionState(loginWithRegister, undefined)

  if (state?.message) {
    toast.error(state.message)
  }
  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Сурагчаар нэвтрэх</CardTitle>
          <CardDescription>Регистрийн дугаараа оруулна уу.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
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

              <RegisterUnknow />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export function EsisLoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const [state, action, pending] = useActionState(loginWithEsis, undefined)

  if (state?.message) {
    toast.error(state.message)
  }
  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">ESIS системээр нэвтрэх</CardTitle>
          <CardDescription>Регистрийн дугаараа оруулна уу.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="username">ESIS нэвтрэх нэр</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="es12345678"
                  required
                />

                <Label htmlFor="password">Нууц үг</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Нууц үг"
                  required
                />
                {state?.errors?.password && (
                  <p className="text-red-400 text-sm">
                    {state.errors.password}
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
