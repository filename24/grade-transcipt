import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { auth } from '@/utils/better-auth'
import { getUser, getUserInfoById } from '@/utils/fetch'

import AvatarDialog from './_Components/avatarDialog'
import DangerZone from './_Components/dangerZone'
import PersonalInfo, { type ExtendedUser } from './_Components/personalInfo'
import SecuritySection from './_Components/securitySection'
import SystemInfo from './_Components/systemInfo'

export const metadata: Metadata = {
  title: 'Knea - Profile',
  openGraph: {
    type: 'website',
    siteName: 'Knea - Profile',
    title: 'Knea - Profile',
    description: 'Сурагчын дүнгийн систем'
  }
}

export default async function Profile() {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  const userData = await getUser(session?.user?.systemId)

  if (!userData) return redirect('/login')
  const systemData =
    userData.classId && userData.systemId
      ? await getUserInfoById(userData.classId, userData.systemId)
      : undefined

  const userExtendedData: ExtendedUser = {
    ...userData,
    firstNameMgl: systemData?.FIRST_NAME_MGL,
    lastNameMgl: systemData?.LAST_NAME_MGL
  }
  return (
    <main>
      <div className="px-6 py-4">
        {/* Avatar and Status */}
        <AvatarDialog userData={userData} />

        {/* Username */}
        <div className="mb-6 flex items-center gap-2">
          <h1 className="font-bold text-2xl">{userData.name}</h1>
        </div>

        <div className="mb-2 grid gap-2 md:grid-cols-2">
          <PersonalInfo userData={userExtendedData} />

          {systemData && <SystemInfo systemData={systemData} />}
        </div>

        <div className="mb-2">
          <SecuritySection />
        </div>

        <div className="grid gap-2">
          <DangerZone />
        </div>
      </div>
    </main>
  )
}
