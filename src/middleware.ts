export { auth as middleware } from '@/utils/auth'

import { auth } from '@/utils/auth'
import { betterFetch } from '@better-fetch/fetch'
import { NextResponse, type NextRequest } from 'next/server'

type Session = typeof auth.$Infer.Session

export default async function authMiddleware(request: NextRequest) {
  const { data: session } = await betterFetch<Session>(
    '/api/auth/get-session',
    {
      baseURL: request.nextUrl.origin,
      headers: {
        //get the cookie from the request
        cookie: request.headers.get('cookie') || ''
      }
    }
  )

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/dash/:path', '/teacher/:path', '/admin/:path']
}
