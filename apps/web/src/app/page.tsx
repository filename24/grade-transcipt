import { redirect } from 'next/navigation'

import { auth } from '@/utils/auth'

export default async function Home() {
  const session = await auth()

  if (!session) {
    return redirect('/login')
  }
  return redirect('/dash')
}
