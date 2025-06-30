import { z } from 'zod'

export const uploadAvatarSchema = z.object({
  avatar: z
    .string()
    .refine(
      (file) => getBase64FileSize(file) <= 5 * 1024 * 1024,
      'Хамгийн ихдээ 5MB байх ёстой'
    ),
  userId: z.string()
})

export function getBase64FileSize(base64: string): number {
  const base64Data = base64.split(';base64,').pop() || base64

  const length = base64Data.length

  const padding = base64Data.endsWith('==')
    ? 2
    : base64Data.endsWith('=')
      ? 1
      : 0

  const sizeInBytes = (length * 3) / 4 - padding

  return Math.round(sizeInBytes)
}
