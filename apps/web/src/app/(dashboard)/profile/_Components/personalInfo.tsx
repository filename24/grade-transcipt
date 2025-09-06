'use client'
import type { User } from '@gt/database'
import { useState } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function PersonalInfo({ userData }: { userData: User }) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Хувийн мэдээлэл</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-1">
            <h2 className="font-medium text-lg">Овог</h2>
            <span className="text-sm ">{userData.lastName}</span>
          </div>
          <div className="grid gap-1">
            <h2 className="font-medium text-lg">Нэр</h2>
            <span className="text-sm ">{userData.firstName}</span>
          </div>

          <div className="grid gap-1">
            <h2 className="font-medium text-lg">Анги</h2>
            <span className="text-sm ">
              {userData.currectAcademicLevel}-р анги
            </span>
          </div>

          <div className="grid gap-1">
            <h2 className="font-medium text-lg">Регистрийн дугаар</h2>
            <div>
              <span className="mr-2 text-sm ">
                {isVisible
                  ? userData.registerNumber.toUpperCase()
                  : userData.registerNumber.slice(0, 2).toUpperCase() +
                    '*'.repeat(userData.registerNumber.length - 2)}
              </span>
              <button
                type="button"
                className={'text-link'}
                onClick={() => setIsVisible(!isVisible)}
              >
                {isVisible ? 'нуух' : 'харах'}
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
