'use client'

import { useEffect, useState } from 'react'

import { authClient } from '@/utils/auth-client'

import PasskeyManager from './passkeyManager'
import PasswordManager from './passwordManager'

export default function SecuritySection() {
  const [hasPassword, setHasPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkPasswordStatus = async () => {
      try {
        const result = await authClient.hasPassword()
        if (result && 'hasPassword' in result) {
          setHasPassword(result.hasPassword as boolean)
        }
      } catch (error) {
        console.error('Failed to check password status:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkPasswordStatus()
  }, [])

  const handlePasswordStatusChange = (status: boolean) => {
    setHasPassword(status)
  }

  if (isLoading) {
    return null
  }

  return (
    <div className="grid gap-2">
      <PasswordManager onPasswordStatusChange={handlePasswordStatusChange} />
      <PasskeyManager hasPassword={hasPassword} />
    </div>
  )
}
