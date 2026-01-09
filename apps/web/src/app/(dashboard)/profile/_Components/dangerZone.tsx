'use client'
import { LogOut } from 'lucide-react'
import { authClient } from '@/utils/auth-client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'

export default function DangerZone() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const router = useRouter()

  async function logout() {
    setIsDialogOpen(false)

    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/login')
        }
      }
    })
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Danger Zone</CardTitle>
      </CardHeader>
      <CardContent>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant={'destructive'}
              onClick={() => setIsDialogOpen(true)}
            >
              <LogOut />
              Системээс гарах
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogHeader className="text-start">
                <DialogTitle>Системмээс гарах</DialogTitle>
                <DialogDescription>
                  Та системээс гарахдаа итгэлтэй байна уу?
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Үгүй
                </Button>

                <Button onClick={logout} variant={'destructive'}>
                  Гарах
                </Button>
              </div>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
