import { toNextJsHandler } from 'better-auth/next-js'
import { auth } from '@/utils/better-auth'

export const { GET, POST } = toNextJsHandler(auth)
