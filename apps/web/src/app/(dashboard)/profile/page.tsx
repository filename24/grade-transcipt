import { auth } from '@/utils/auth'
import { getUser } from '@/utils/fetch'
import { redirect } from 'next/navigation'
import PersonalInfo from './_Components/personalInfo'
import AvatarDialog from './_Components/avatarDialog'
import DangerZone from './_Components/dangerZone'

export default async function Profile() {
  const session = await auth()

  const userData = await getUser(session?.user?.systemId)

  if (!userData) return redirect('/login')

  return (
    <main>
      <div className="px-6 py-4">
        {/* Avatar and Status */}
        <AvatarDialog userData={userData} />

        {/* Username */}
        <div className="mb-6 flex items-center gap-2">
          <h1 className="font-bold text-2xl">{userData.name}</h1>
        </div>

        <div className="grid gap-2">
          <PersonalInfo userData={userData} />

          <DangerZone />
        </div>
      </div>
    </main>
  )
}
