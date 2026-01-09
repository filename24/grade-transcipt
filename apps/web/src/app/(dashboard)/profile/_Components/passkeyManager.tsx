'use client'

import { Edit2, Fingerprint, Loader2, Plus, Shield, Trash2 } from 'lucide-react'
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
import { getBrowserAndOS } from '@/utils'
import { authClient } from '@/utils/auth-client'

interface Passkey {
  id: string
  name: string | null
  credentialID: string
  deviceType: string
  createdAt: Date | null
}

interface PasskeyManagerProps {
  hasPassword?: boolean
}

export default function PasskeyManager({
  hasPassword = false
}: PasskeyManagerProps) {
  const [passkeys, setPasskeys] = useState<Passkey[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [newPasskeyName, setNewPasskeyName] = useState('')
  const [isSupported, setIsSupported] = useState(false)

  // Edit passkey state
  const [editingPasskey, setEditingPasskey] = useState<Passkey | null>(null)
  const [editName, setEditName] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  const fetchPasskeys = async () => {
    try {
      const result = await authClient.passkey.listUserPasskeys()
      if (result?.data) {
        setPasskeys(result.data as Passkey[])
      }
    } catch (error) {
      console.error('Failed to fetch passkeys:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: 컴포넌트 마운트 시에만 실행
  useEffect(() => {
    // Check if WebAuthn is supported
    const checkWebAuthnSupport = async () => {
      if (typeof window === 'undefined' || !window.PublicKeyCredential) {
        return
      }

      try {
        // Check if platform authenticator is available
        const platformAvailable =
          await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()

        // Check if conditional mediation is available (for cross-device passkeys)
        const conditionalAvailable =
          typeof PublicKeyCredential.isConditionalMediationAvailable ===
          'function'
            ? await PublicKeyCredential.isConditionalMediationAvailable()
            : false

        // Support passkeys if either platform authenticator or conditional mediation is available
        setIsSupported(platformAvailable || conditionalAvailable)
      } catch {
        // Fallback: if the check fails, assume supported if PublicKeyCredential exists
        setIsSupported(true)
      }
    }

    checkWebAuthnSupport()
    fetchPasskeys()
  }, [])

  const handleAddPasskey = async () => {
    // Check if password is set
    if (!hasPassword) {
      toast.error('Passkey нэмэхийн өмнө нууц үг тохируулах шаардлагатай.')
      return
    }

    setIsAdding(true)
    try {
      // Use browser and OS info if no name is provided
      const passkeyName = newPasskeyName.trim() || getBrowserAndOS()

      const result = await authClient.passkey.addPasskey({
        name: passkeyName
      })

      if (result?.error) {
        const errorMsg =
          typeof result.error === 'object' && 'message' in result.error
            ? result.error.message
            : 'Passkey нэмэхэд алдаа гарлаа.'
        toast.error(errorMsg)
        return
      }

      toast.success('Passkey амжилттай нэмэгдлээ!')
      setNewPasskeyName('')
      fetchPasskeys()
    } catch (error) {
      console.error('Failed to add passkey:', error)
      toast.error('Passkey нэмэхэд алдаа гарлаа.')
    } finally {
      setIsAdding(false)
    }
  }

  const handleDeletePasskey = async (id: string) => {
    setDeletingId(id)
    try {
      const result = await authClient.passkey.deletePasskey({ id })

      if (result?.error) {
        const errorMsg =
          typeof result.error === 'object' && 'message' in result.error
            ? result.error.message
            : 'Passkey устгахад алдаа гарлаа.'
        toast.error(errorMsg)
        return
      }

      toast.success('Passkey амжилттай устгагдлаа!')
      setPasskeys(passkeys.filter((p) => p.id !== id))
    } catch (error) {
      console.error('Failed to delete passkey:', error)
      toast.error('Passkey устгахад алдаа гарлаа.')
    } finally {
      setDeletingId(null)
    }
  }

  const handleUpdatePasskey = async () => {
    if (!editingPasskey) return

    setIsUpdating(true)
    try {
      const result = await authClient.passkey.updatePasskey({
        id: editingPasskey.id,
        name: editName
      })

      if (result?.error) {
        const errorMsg =
          typeof result.error === 'object' && 'message' in result.error
            ? result.error.message
            : 'Passkey засахад алдаа гарлаа.'
        toast.error(errorMsg)
        return
      }

      toast.success('Passkey амжилттай засагдлаа!')
      setPasskeys(
        passkeys.map((p) =>
          p.id === editingPasskey.id ? { ...p, name: editName } : p
        )
      )
      setEditingPasskey(null)
      setEditName('')
    } catch (error) {
      console.error('Failed to update passkey:', error)
      toast.error('Passkey засахад алдаа гарлаа.')
    } finally {
      setIsUpdating(false)
    }
  }

  const openEditDialog = (passkey: Passkey) => {
    setEditingPasskey(passkey)
    setEditName(passkey.name || '')
  }

  const formatDate = (date: Date | null) => {
    if (!date) return 'Тодорхойгүй'
    return new Intl.DateTimeFormat('mn-MN', {
      dateStyle: 'short'
    }).format(new Date(date))
  }

  const getDeviceTypeName = (deviceType: string) => {
    switch (deviceType) {
      case 'singleDevice':
        return 'Энэ төхөөрөмж'
      case 'multiDevice':
        return 'Олон төхөөрөмж'
      default:
        return deviceType
    }
  }

  if (!isSupported) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Fingerprint className="h-5 w-5" />
          Passkey удирдлага
        </CardTitle>
        <CardDescription>
          Passkey ашиглан хурууны хээ эсвэл нүүр царайгаараа хурдан нэвтрээрэй.
          Яг л Apple-ийн FaceID шиг хялбар!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Password warning */}
        {!hasPassword && (
          <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950">
            <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <p className="text-amber-800 text-sm dark:text-amber-200">
              Passkey нэмэхийн өмнө нууц үг тохируулах шаардлагатай.
            </p>
          </div>
        )}

        {/* Add new passkey */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="passkey-name" className="sr-only">
              Passkey нэр
            </Label>
            <Input
              id="passkey-name"
              placeholder="Passkey нэр (заавал биш)"
              value={newPasskeyName}
              onChange={(e) => setNewPasskeyName(e.target.value)}
              disabled={!hasPassword}
            />
          </div>
          <Button
            size="sm"
            onClick={handleAddPasskey}
            disabled={isAdding || !hasPassword}
          >
            {isAdding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Plus className="mr-1 h-4 w-4" />
                Нэмэх
              </>
            )}
          </Button>
        </div>

        {/* Passkey list */}
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : passkeys.length === 0 ? (
          <p className="py-4 text-center text-muted-foreground text-sm">
            Бүртгэгдсэн Passkey байхгүй байна.
          </p>
        ) : (
          <div className="max-h-[240px] space-y-2 overflow-y-auto">
            {passkeys.map((passkey) => (
              <div
                key={passkey.id}
                className="flex items-start justify-between gap-2 rounded-lg border p-3"
              >
                <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
                  <Fingerprint className="h-5 w-5 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-sm">
                      {passkey.name || 'Нэргүй Passkey'}
                    </p>
                    <p className="truncate text-muted-foreground text-xs">
                      {getDeviceTypeName(passkey.deviceType)} •{' '}
                      {formatDate(passkey.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(passkey)}
                  >
                    <Edit2 className="h-4 w-4 text-muted-foreground" />
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={deletingId === passkey.id}
                      >
                        {deletingId === passkey.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-destructive" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Passkey устгах</AlertDialogTitle>
                        <AlertDialogDescription>
                          Та "{passkey.name || 'Нэргүй Passkey'}" passkey-г
                          устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах
                          боломжгүй.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Цуцлах</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeletePasskey(passkey.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Устгах
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Passkey Dialog */}
        <Dialog
          open={!!editingPasskey}
          onOpenChange={(open) => {
            if (!open) {
              setEditingPasskey(null)
              setEditName('')
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Passkey нэр засах</DialogTitle>
              <DialogDescription>
                Passkey-ийн нэрийг өөрчилнө үү.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-passkey-name">Passkey нэр</Label>
                <Input
                  id="edit-passkey-name"
                  placeholder="Жишээ: iPhone"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  disabled={isUpdating}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setEditingPasskey(null)
                  setEditName('')
                }}
                disabled={isUpdating}
              >
                Цуцлах
              </Button>
              <Button onClick={handleUpdatePasskey} disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Түр хүлээнэ үү...
                  </>
                ) : (
                  'Хадгалах'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
