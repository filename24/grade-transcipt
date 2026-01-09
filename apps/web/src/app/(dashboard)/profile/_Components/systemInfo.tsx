'use client'
import type { GroupStudent } from '@gt/esis'
import { useState } from 'react'

import { CopyButton } from '@/components/copy-button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDateToYYYYMMDD } from '@/utils'

export default function SystemInfo({
  systemData
}: {
  systemData: GroupStudent
}) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Системийн мэдээлэл</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-1">
            <h2 className="font-medium text-lg">Medle цахим хаяг</h2>
            <div className="flex items-center gap-2">
              <span className="min-w-0 flex-1 truncate text-sm">
                {systemData.MICROSOFT_EMAIL}
              </span>
              <CopyButton textToCopy={systemData.MICROSOFT_EMAIL} />
            </div>
          </div>

          <div className="grid gap-1">
            <h2 className="font-medium text-lg">Google цахим хаяг</h2>
            <div className="flex items-center gap-2">
              <span className="min-w-0 flex-1 truncate text-sm">
                {systemData.GOOGLE_EMAIL}
              </span>
              <CopyButton textToCopy={systemData.GOOGLE_EMAIL} />
            </div>
          </div>

          <div className="grid gap-1">
            <h2 className="font-medium text-lg">Нууц үг</h2>
            <div className="flex items-center gap-2">
              <span className="min-w-0 flex-1 truncate text-sm">
                {isVisible ? systemData.MICROSOFT_PASSWORD : '*'.repeat(8)}
              </span>
              <button
                type="button"
                className={'shrink-0 text-link'}
                onClick={() => setIsVisible(!isVisible)}
              >
                {isVisible ? 'нуух' : 'харах'}
              </button>
              <CopyButton textToCopy={systemData.MICROSOFT_PASSWORD} />
            </div>
          </div>
          <div className="grid gap-1">
            <h2 className="font-medium text-lg">bagshsystem.mn нууц үг</h2>
            <div className="flex items-center gap-2">
              <span className="min-w-0 flex-1 truncate text-sm">
                {isVisible
                  ? formatDateToYYYYMMDD(systemData.DATE_OF_BIRTH)
                  : '*'.repeat(8)}
              </span>
              <button
                type="button"
                className={'shrink-0 text-link'}
                onClick={() => setIsVisible(!isVisible)}
              >
                {isVisible ? 'нуух' : 'харах'}
              </button>
              <CopyButton
                textToCopy={formatDateToYYYYMMDD(systemData.DATE_OF_BIRTH)}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
