import { auth } from '@/utils/auth'
import { getUser } from '@/utils/fetch'
import { ChevronDown } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function Profile() {
  const session = await auth()

  const userData = await getUser(session?.user?.systemId)

  if (!userData) return redirect('/login')

  return (
    <main>
      <div className="px-6 py-4">
        {/* Avatar and Status */}
        <div className="relative mb-4">
          <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-black">
            <div className="flex h-full w-full items-center justify-center bg-gray-800">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-700">
                <div className="h-12 w-12 rounded-full bg-amber-600" />
              </div>
            </div>
            <div className="absolute right-1 bottom-1 h-6 w-6 rounded-full border-2 border-black bg-green-500" />
          </div>
        </div>

        {/* Username */}
        <div className="mb-2 flex items-center gap-2">
          <h1 className="font-bold text-2xl">{userData.name}</h1>
          <ChevronDown className="h-5 w-5" />
        </div>
      </div>
    </main>
  )
}
