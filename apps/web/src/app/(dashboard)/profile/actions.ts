'use server'

import * as Sentry from '@sentry/nextjs'
import prisma, { DeleteObjectCommand, PutObjectCommand, s3 } from '@gt/database'
import { revalidateTag } from 'next/cache'
import type { z } from 'zod'

import { uploadAvatarSchema } from '@/schemas/uploadAvatar'
import { SnowflakeId } from '@/utils'
import { auth } from '@/utils/better-auth';
import { headers } from 'next/headers';

export async function uploadAvatar(
  data: z.infer<typeof uploadAvatarSchema>
): Promise<ChangeAvatarFormState> {
  const reslovedData = uploadAvatarSchema.safeParse(data)

  if (!reslovedData.success) {
    throw new Error(reslovedData.error.flatten().fieldErrors.avatar?.join(', '))
  }
  const { avatar, userId } = reslovedData.data

  const base64Data = avatar.split(';base64,').pop() || avatar
  const buffer = Buffer.from(base64Data, 'base64')

  const avatarId = String(SnowflakeId.generate())
  const filename = `avatar/${avatarId}.png`

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: filename,
    Body: buffer,
    ContentType: 'image/png',
    ACL: 'public-read'
  })

  try {
    await s3.send(command)
  } catch (error) {
    Sentry.captureException(error, {
      tags: { feature: 'profile-avatar', service: 's3', operation: 'upload' },
      extra: { userId, filename }
    })
    throw new Error('Серверийн алдаа гарлаа. Та дараа дахин оролдон уу.')
  }

  try {

    await auth.api.updateUser({
      body: {
        avatar: avatarId,
      },
      headers: await headers()
    })
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        feature: 'profile-avatar',
        service: 'prisma',
        operation: 'upload'
      },
      extra: { userId, filename }
    })
    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: filename
    })
    await s3.send(deleteCommand)

    throw new Error('Серверийн алдаа гарлаа. Та дараа дахин оролдон уу.')
  }

  revalidateTag(`user-${userId}`, 'max')
  return {
    message:
      'Амжилттай хадгалагдлаа. Хэрэв зураг бүтэн ороогүй тохиолдолд системээс гараад дахин нэвтэрнэ үү',
    data: avatarId
  }
}

export async function deleteAvatar(
  systemId: string
): Promise<ChangeAvatarFormState> {
  const user = await prisma.user.findFirst({
    where: {
      systemId
    },
    select: {
      avatar: true
    }
  })

  if (!user) {
    throw new Error('Серверийн алдаа гарлаа. Та дараа дахин оролдон уу.')
  }

  try {
    await prisma.user.update({
      where: {
        systemId
      },
      data: {
        avatar: null
      }
    })
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        feature: 'profile-avatar',
        service: 'prisma',
        operation: 'delete'
      },
      extra: { systemId, avatarId: user.avatar }
    })
    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `avatar/${user.avatar}.png`
    })
    await s3.send(deleteCommand).catch(() => {})

    throw new Error('Серверийн алдаа гарлаа. Та дараа дахин оролдон уу.')
  }

  revalidateTag(`user-${systemId}`, 'max')
  return {
    message:
      'Амжилттай устгагдлаа. Хэрэв зураг бүтэн ороогүй тохиолдолд системээс гараад дахин нэвтэрнэ үү'
  }
}

export type ChangeAvatarFormState =
  | {
      errors?: {
        avatar?: string[]
      }
      message?: string
      data?: string
    }
  | undefined
