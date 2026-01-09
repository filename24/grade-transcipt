import { z } from 'zod'

export const RegisterLoginSchema = z.object({
  registerNumber: z
    .string()
    .regex(/[А-ЯӨҮа-яөү]{2}[0-9]{8}/, 'Регистрийн дугаарын формат буруу байна.')
    .toLowerCase(),
  password: z.string().optional()
})

export const EsisLoginSchema = z.object({
  username: z.string().toLowerCase(),
  password: z.string().min(8, 'Нууц үг багадаа 8 тэмдэгт байх ёстой.')
})
