'use client'
import { useState } from 'react'

import { CopyButton } from '@/components/copy-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDateToYYYYMMDD } from '@/utils'

/**
 * 시스템 정보 카드. 재학생(API-000144)은 이메일/비밀번호까지, 졸업생
 * (API-000249)은 제공되는 항목(생년월일 기반 비밀번호)만 노출한다. 값이 없는
 * 항목은 렌더하지 않는다.
 */
export interface SystemInfoData {
  microsoftEmail?: string | null
  googleEmail?: string | null
  microsoftEmailPass?: string | null
  /** @format ISO 8601 — bagshsystem.mn 비밀번호로 사용 */
  dateOfBirth?: string | null
  /** 졸업 학년도 (API-000249) */
  conferAcademicYear?: string | null
  /** 졸업 일자 (API-000249) @format ISO 8601 */
  conferDate?: string | null
  /** 학위/졸업 증서 번호 (API-000249) */
  degreeNidNumber?: string | null
}

export default function SystemInfo({
  systemData
}: {
  systemData: SystemInfoData
}) {
  const [isVisible, setIsVisible] = useState(false)

  const bagshPassword = systemData.dateOfBirth
    ? formatDateToYYYYMMDD(systemData.dateOfBirth)
    : null

  const conferDateText = systemData.conferDate
    ? formatDateToYYYYMMDD(systemData.conferDate)
    : null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Системийн мэдээлэл</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {systemData.microsoftEmail && (
            <div className="grid gap-1">
              <h2 className="font-medium text-lg">Medle цахим хаяг</h2>
              <div className="flex items-center gap-2">
                <span className="min-w-0 flex-1 truncate text-sm">
                  {systemData.microsoftEmail}
                </span>
                <CopyButton textToCopy={systemData.microsoftEmail} />
              </div>
            </div>
          )}

          {systemData.googleEmail && (
            <div className="grid gap-1">
              <h2 className="font-medium text-lg">Google цахим хаяг</h2>
              <div className="flex items-center gap-2">
                <span className="min-w-0 flex-1 truncate text-sm">
                  {systemData.googleEmail}
                </span>
                <CopyButton textToCopy={systemData.googleEmail} />
              </div>
            </div>
          )}

          {systemData.microsoftEmailPass && (
            <div className="grid gap-1">
              <h2 className="font-medium text-lg">Нууц үг</h2>
              <div className="flex items-center gap-2">
                <span className="min-w-0 flex-1 truncate text-sm">
                  {isVisible ? systemData.microsoftEmailPass : '*'.repeat(8)}
                </span>
                <button
                  type="button"
                  className={'shrink-0 text-link'}
                  onClick={() => setIsVisible(!isVisible)}
                >
                  {isVisible ? 'нуух' : 'харах'}
                </button>
                <CopyButton textToCopy={systemData.microsoftEmailPass} />
              </div>
            </div>
          )}

          {bagshPassword && (
            <div className="grid gap-1">
              <h2 className="font-medium text-lg">bagshsystem.mn нууц үг</h2>
              <div className="flex items-center gap-2">
                <span className="min-w-0 flex-1 truncate text-sm">
                  {isVisible ? bagshPassword : '*'.repeat(8)}
                </span>
                <button
                  type="button"
                  className={'shrink-0 text-link'}
                  onClick={() => setIsVisible(!isVisible)}
                >
                  {isVisible ? 'нуух' : 'харах'}
                </button>
                <CopyButton textToCopy={bagshPassword} />
              </div>
            </div>
          )}

          {/* 졸업 정보 (API-000249) */}
          {systemData.conferAcademicYear && (
            <div className="grid gap-1">
              <h2 className="font-medium text-lg">Төгссөн хичээлийн жил</h2>
              <span className="text-sm">{systemData.conferAcademicYear}</span>
            </div>
          )}

          {conferDateText && (
            <div className="grid gap-1">
              <h2 className="font-medium text-lg">Төгссөн огноо</h2>
              <span className="text-sm">{conferDateText}</span>
            </div>
          )}

          {systemData.degreeNidNumber && (
            <div className="grid gap-1">
              <h2 className="font-medium text-lg">Гэрчилгээний дугаар</h2>
              <div className="flex items-center gap-2">
                <span className="min-w-0 flex-1 truncate text-sm">
                  {systemData.degreeNidNumber}
                </span>
                <CopyButton textToCopy={systemData.degreeNidNumber} />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
