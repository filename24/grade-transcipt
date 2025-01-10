import { z } from 'zod'

export const LoginSchema = z.object({
  registerNumber: z
    .string()
    .regex(/[А-ЯӨҮа-яөү]{2}[0-9]{8}/, 'Регистрийн дугаарын формат буруу байна.')
    .toLowerCase()
})
