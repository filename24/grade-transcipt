import prisma from '@gt/database'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { auth } from '@/utils/better-auth'
import {
  getGraduateInfoByRegisterNumber,
  getStudentInfoByRegisterNumber,
  getUser
} from '@/utils/fetch'

import AdditionalInfo from './_Components/additionalInfo'
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
  // 등록번호(РД)로 조회 → groupId가 없는 졸업생도 시스템 정보를 가져올 수 있다.
  const registerInfo = userData.registerNumber
    ? await getStudentInfoByRegisterNumber(userData.registerNumber)
    : undefined

  // 재학생 검색(API-000144)에서 못 찾으면 졸업생 정보(API-000249)로 폴백.
  const graduateInfo =
    !registerInfo && userData.registerNumber
      ? await getGraduateInfoByRegisterNumber(userData.registerNumber)
      : undefined

  // SystemInfo 카드용 정규화. 졸업생 응답에는 이메일/비밀번호가 없고
  // 생년월일(bagshsystem.mn 비밀번호)만 제공된다.
  const systemData = registerInfo
    ? {
        microsoftEmail: registerInfo.microsoftEmail,
        googleEmail: registerInfo.googleEmail,
        microsoftEmailPass: registerInfo.microsoftEmailPass,
        dateOfBirth: registerInfo.dateOfBirth
      }
    : graduateInfo
      ? {
          dateOfBirth: graduateInfo.dateOfBirth,
          conferAcademicYear: graduateInfo.conferAcademicYear,
          conferDate: graduateInfo.conferDate,
          degreeNidNumber: graduateInfo.degreeNidNumber
        }
      : undefined

  const userExtendedData: ExtendedUser = {
    ...userData,
    firstNameMgl: registerInfo?.firstNameMgl,
    lastNameMgl: registerInfo?.lastNameMgl
  }

  // 어드민이 수동 입력한 추가 정보 (읽기 전용 노출)
  const additionalInfo = session?.user?.id
    ? await prisma.userInfo.findMany({
        where: { userId: session.user.id },
        orderBy: { name: 'asc' }
      })
    : []

  return (
    <main>
      <div className="px-2">
        {/* Avatar and Status */}
        <AvatarDialog userData={userData} />

        {/* Username */}
        <div className="mb-6 flex items-center gap-2">
          <h1 className="font-bold text-2xl">{userData.name}</h1>
        </div>

        <div className="mb-2 grid gap-2 md:grid-cols-2">
          <PersonalInfo userData={userExtendedData} />

          {systemData && <SystemInfo systemData={systemData} />}

          {additionalInfo.length > 0 && (
            <AdditionalInfo items={additionalInfo} />
          )}
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
