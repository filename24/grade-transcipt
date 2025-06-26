import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

import { auth } from '@/utils/auth'
import { getUser } from '@/utils/fetch'
import { redirect } from 'next/navigation'
import PersonalInfo from './_Components/personalInfo'

export default async function Profile() {
  const session = await auth()

  const userData = await getUser(session?.user?.systemId)

  if (!userData) return redirect('/login')

  return (
    <main>
      <div className="px-6 py-4">
        {/* Avatar and Status */}
        <div className="relative mb-4">
          <Avatar className="size-24 border-2">
            <AvatarImage
              src={`${process.env.S3_ENDPOINT}/grade-transcript/profile/default_${Number(userData.registerNumber.replace(/\D/g, '')) % 7}.png`}
            />
            <AvatarFallback>{userData.firstName}</AvatarFallback>
          </Avatar>
        </div>

        {/* Username */}
        <div className="mb-6 flex items-center gap-2">
          <h1 className="font-bold text-2xl">{userData.name}</h1>
        </div>

        <PersonalInfo userData={userData} />
      </div>
    </main>
  )
}
