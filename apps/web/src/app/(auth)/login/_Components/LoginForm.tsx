'use client'
import { Fingerprint, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { loginWithRegister } from '@/app/(auth)/login/actions'
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
import { Separator } from '@/components/ui/separator'
import { cn } from '@/utils'
import { authClient } from '@/utils/auth-client'

import RegisterUnknow from './RegisterDialog'

export function RegisterLoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const [state, action, pending] = useActionState(loginWithRegister, undefined)
  const [passkeyLoading, setPasskeyLoading] = useState(false)
  const [passkeyAvailable, setPasskeyAvailable] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [savedRegisterNumber, setSavedRegisterNumber] = useState('')
  const passwordRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    // Check if passkey (WebAuthn) is available
    const checkPasskeySupport = async () => {
      if (typeof window === 'undefined' || !window.PublicKeyCredential) {
        return
      }

      try {
        // Check if platform authenticator is available (Face ID, Touch ID, Windows Hello, etc.)
        const available =
          await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        setPasskeyAvailable(available)
      } catch {
        // Fallback: if the check fails, still show the button if WebAuthn is supported
        setPasskeyAvailable(true)
      }
    }

    checkPasskeySupport()
  }, [])

  // Handle password required response
  useEffect(() => {
    if (state?.requiresPassword && state.registerNumber) {
      setShowPassword(true)
      setSavedRegisterNumber(state.registerNumber)
      // Focus password field after state update
      setTimeout(() => passwordRef.current?.focus(), 100)
    }
  }, [state?.requiresPassword, state?.registerNumber])

  // Show error messages (but not the "password required" prompt)
  useEffect(() => {
    if (state?.message && !state.requiresPassword) {
      toast.error(state.message)
    }
  }, [state?.message, state?.requiresPassword])

  const handlePasskeyLogin = async () => {
    setPasskeyLoading(true)
    try {
      const result = await authClient.signIn.passkey({
        fetchOptions: {
          onSuccess: () => {
            router.push('/dash')
          },
          onError: (ctx) => {
            toast.error(
              ctx.error.message || 'Passkey нэвтрэлт амжилтгүй боллоо.'
            )
          }
        }
      })

      if (result?.error) {
        toast.error(
          result.error.message || 'Passkey нэвтрэлт амжилтгүй боллоо.'
        )
      }
    } catch (error) {
      console.error('Passkey login error:', error)
      toast.error('Passkey нэвтрэлт амжилтгүй боллоо.')
    } finally {
      setPasskeyLoading(false)
    }
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
                {showPassword && (
                  <input
                    type="hidden"
                    name="registerNumber"
                    value={savedRegisterNumber}
                  />
                )}
                <Input
                  id="registerNumber"
                  name={showPassword ? undefined : 'registerNumber'}
                  type="text"
                  placeholder="АБ12345678"
                  maxLength={10}
                  autoComplete="username webauthn"
                  defaultValue={savedRegisterNumber}
                  readOnly={showPassword}
                  className={showPassword ? 'bg-muted' : ''}
                  required={!showPassword}
                />
                {state?.errors?.registerNumber && (
                  <p className="text-red-400 text-sm">
                    {state.errors.registerNumber}
                  </p>
                )}
              </div>

              {showPassword && (
                <div className="grid gap-3">
                  <Label htmlFor="password">Нууц үг</Label>
                  <Input
                    ref={passwordRef}
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Нууц үгээ оруулна уу"
                    autoComplete="current-password"
                    required
                  />
                  {state?.errors?.password && (
                    <p className="text-red-400 text-sm">
                      {state.errors.password}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setShowPassword(false)
                      setSavedRegisterNumber('')
                    }}
                    className="text-left text-muted-foreground text-sm hover:text-primary"
                  >
                    Өөр бүртгэлээр нэвтрэх
                  </button>
                </div>
              )}

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

              {passkeyAvailable && (
                <>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">
                        Эсвэл
                      </span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    disabled={passkeyLoading}
                    onClick={handlePasskeyLogin}
                    className="w-full"
                  >
                    {passkeyLoading ? (
                      <>
                        <Loader2 className="animate-spin" />
                        Түр хүлээнэ үү...
                      </>
                    ) : (
                      <>
                        <Fingerprint className="mr-2 h-4 w-4" />
                        Passkey-ээр нэвтрэх
                      </>
                    )}
                  </Button>
                </>
              )}

              <RegisterUnknow />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

// export function EsisLoginForm({
//   className,
//   ...props
// }: React.ComponentPropsWithoutRef<'div'>) {
//   const [state, action, pending] = useActionState(loginWithEsis, undefined)

//   if (state?.message) {
//     toast.error(state.message)
//   }
//   return (
//     <div className={cn('flex flex-col gap-6', className)} {...props}>
//       <Card>
//         <CardHeader>
//           <CardTitle className="text-2xl">ESIS системээр нэвтрэх</CardTitle>
//           <CardDescription>Регистрийн дугаараа оруулна уу.</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <form action={action}>
//             <div className="flex flex-col gap-6">
//               <div className="grid gap-2">
//                 <Label htmlFor="username">ESIS нэвтрэх нэр</Label>
//                 <Input
//                   id="username"
//                   name="username"
//                   type="text"
//                   placeholder="es12345678"
//                   required
//                 />

//                 <Label htmlFor="password">Нууц үг</Label>
//                 <Input
//                   id="password"
//                   name="password"
//                   type="password"
//                   placeholder="Нууц үг"
//                   required
//                 />
//                 {state?.errors?.password && (
//                   <p className="text-red-400 text-sm">
//                     {state.errors.password}
//                   </p>
//                 )}
//               </div>
//               <Button type="submit" disabled={pending} className="w-full">
//                 {pending ? (
//                   <>
//                     <Loader2 className="animate-spin" />
//                     Түр хүлээнэ үү...
//                   </>
//                 ) : (
//                   'Нэвтрэх'
//                 )}
//               </Button>
//             </div>
//           </form>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }
