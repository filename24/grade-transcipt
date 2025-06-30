'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { LogOut } from 'lucide-react'

export default function DangerZone() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  function logout() {
    setIsDialogOpen(false)

    signOut()
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
