'use client'

import type { User } from '@gt/database'
import localFont from 'next/font/local' // 1. 폰트 로드 기능
import { useState } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const mongolFont = localFont({
  src: '../../../../../public/fonts/cmdashitseden.ttf',
  display: 'swap',
  variable: '--font-mongol'
})

export interface ExtendedUser extends User {
  firstNameMgl?: string | null
  lastNameMgl?: string | null
}

export default function PersonalInfo({ userData }: { userData: ExtendedUser }) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Хувийн мэдээлэл</CardTitle>
      </CardHeader>
      <CardContent>
        {/* 전체 레이아웃: 좌우 배치 */}
        <div className="flex items-start justify-between">
          {/* [LEFT] 기존 정보 영역 */}
          <div className="grid flex-1 gap-4">
            <div className="grid gap-1">
              <h2 className="font-medium text-lg">Овог</h2>
              <span className="text-sm">{userData.lastName}</span>
            </div>
            <div className="grid gap-1">
              <h2 className="font-medium text-lg">Нэр</h2>
              <span className="text-sm">{userData.firstName}</span>
            </div>

            <div className="grid gap-1">
              <h2 className="font-medium text-lg">Анги</h2>
              <span className="text-sm">
                {userData.currectAcademicLevel}-р анги
              </span>
            </div>

            <div className="grid gap-1">
              <h2 className="font-medium text-lg">Регистрийн дугаар</h2>
              <div>
                <span className="mr-2 text-sm">
                  {isVisible
                    ? userData.registerNumber.toUpperCase()
                    : userData.registerNumber.slice(0, 2).toUpperCase() +
                      '*'.repeat(userData.registerNumber.length - 2)}
                </span>
                <button
                  type="button"
                  className={'text-link text-sm hover:underline'}
                  onClick={() => setIsVisible(!isVisible)}
                >
                  {isVisible ? 'нуух' : 'харах'}
                </button>
              </div>
            </div>
          </div>

          {(userData.firstNameMgl || userData.lastNameMgl) && (
            <div className="ml-4 flex min-h-40 justify-center gap-3 pl-6">
              {userData.lastNameMgl && (
                <div
                  className={`${mongolFont.className} select-none text-xl leading-none lg:text-2xl`}
                  style={{
                    writingMode: 'vertical-lr',
                    textOrientation: 'mixed'
                  }}
                >
                  {userData.lastNameMgl}
                </div>
              )}

              {userData.firstNameMgl && (
                <div
                  className={`${mongolFont.className} select-none text-xl leading-none lg:text-2xl`}
                  style={{
                    writingMode: 'vertical-lr',
                    textOrientation: 'mixed'
                  }}
                >
                  {userData.firstNameMgl}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
