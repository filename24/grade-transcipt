'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Loader2, Pencil } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import type { User } from '@gt/database'
import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from '@/components/ui/form'
import Cropper, { type ReactCropperElement } from 'react-cropper'
import { Button } from '@/components/ui/button'
import { deleteAvatar, uploadAvatar } from '../actions'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'

import '@/styles/crop.css'
import { CDN_ENDPOINT } from '@/utils/constants'
import { getUserDefaultAvatarUrl } from '@/utils'

export default function ({ userData }: { userData: User }) {
  const [preview, setPreview] = useState<string | null>(null)
  const [isCropOpen, setIsCropOpen] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(
    userData.avatar
      ? `${CDN_ENDPOINT}/avatar/${userData.avatar}.png`
      : getUserDefaultAvatarUrl(userData.registerNumber)
  )
  const cropperRef = useRef<ReactCropperElement>(null)
  const form = useForm<{ avatar: File | undefined }>()

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (file: File | undefined) => void
  ) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)

        setIsCropOpen(true)
      }
      reader.readAsDataURL(file)
      onChange(file)
    } else {
      setPreview(null)
      onChange(undefined)
    }
  }

  const getCropData = () => {
    if (typeof cropperRef.current?.cropper === 'undefined') {
      return undefined
    }
    return cropperRef.current.cropper.getCroppedCanvas().toDataURL('image/png')
  }

  const onSubmit = async () => {
    setIsLoading(true)
    const cropData = getCropData()

    if (!cropData) {
      return toast.error('Зураг олдсонгүй. Та дахин оролдон уу')
    }

    uploadAvatar({ avatar: cropData, userId: userData.systemId })
      .then((payload) => {
        toast.success(payload?.message)
        if (payload?.data) {
          setAvatarUrl(`${CDN_ENDPOINT}/avatar/${payload.data}.png`)
        }

        setIsCropOpen(false)
        setIsLoading(false)
      })
      .catch((error: Error) => {
        toast.error(error.message)
        setIsLoading(false)
      })
  }

  const removeProfile = async () => {
    setIsLoading(true)

    deleteAvatar(userData.systemId)
      .then((payload) => {
        toast.success(payload?.message)

        setAvatarUrl(getUserDefaultAvatarUrl(userData.registerNumber))

        setIsDialogOpen(false)
        setIsLoading(false)
      })
      .catch((error: Error) => {
        toast.error(error.message)
        setIsLoading(false)
      })
  }

  return (
    <div className="relative mb-4 w-fit">
      <Avatar className="relative size-24 border-2">
        <AvatarImage src={avatarUrl} />
        <AvatarFallback>{userData.firstName}</AvatarFallback>
      </Avatar>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="absolute top-0 right-1 z-50 translate-x-1/4 translate-y-1/4 rounded-full bg-accent p-1 shadow-md hover:bg-accent/90"
            title="Edit profile"
            type="button"
          >
            <Pencil className="m-1 h-4 w-4 text-accent-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem asChild>
            <Label htmlFor="avatar-upload">Зураг оруулах</Label>
          </DropdownMenuItem>

          <DropdownMenuItem
            hidden={!userData.avatar}
            onClick={() => {
              setIsDialogOpen(true)
            }}
          >
            Зураг устгах
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Profile picture remove */}
      <Dialog open={isDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-start">Зураг устгах</DialogTitle>
            <DialogDescription>
              Та зургаа устгахдаа итгэлтэй байна уу?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Цуцлах
            </Button>

            <Button
              onClick={removeProfile}
              disabled={isLoading}
              variant={'destructive'}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" />
                  Түр хүлээнэ үү...
                </>
              ) : (
                'Устгах'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* This form used Зураг оруулах label*/}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="hidden space-y-6"
        >
          <FormField
            control={form.control}
            name="avatar"
            render={({ field: { onChange, value, ...fieldProps } }) => (
              <FormItem>
                <FormControl>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    {...fieldProps}
                    onChange={(e) => handleFileChange(e, onChange)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>

      {/* Profile crop */}
      <Dialog open={isCropOpen} onOpenChange={setIsCropOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Зураг тохируулах</DialogTitle>
          </DialogHeader>
          <div className="relative">
            {preview && (
              <Cropper
                src={preview}
                aspectRatio={1}
                guides={true}
                viewMode={1}
                background={false}
                responsive={true}
                autoCropArea={1}
                checkOrientation={false}
                ref={cropperRef}
              />
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsCropOpen(false)}>
              Цуцлах
            </Button>
            <Button onClick={onSubmit} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" />
                  Түр хүлээнэ үү...
                </>
              ) : (
                'Оруулах'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
