'use client'

import { useEffect, useState } from 'react'

import { authClient } from '@/utils/auth-client'

import PasswordSetupModal from './PasswordSetupModal'

const STORAGE_KEY = 'password-setup-dismissed'

export default function PasswordSetupChecker() {
  const [showModal, setShowModal] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkPasswordStatus = async () => {
      // Check if user has dismissed the modal before
      const dismissed = sessionStorage.getItem(STORAGE_KEY)
      if (dismissed) {
        setIsChecking(false)
        return
      }

      try {
        const result = await authClient.hasPassword()
        if (result && 'hasPassword' in result && !result.hasPassword) {
          setShowModal(true)
        }
      } catch (error) {
        console.error('Failed to check password status:', error)
      } finally {
        setIsChecking(false)
      }
    }

    checkPasswordStatus()
  }, [])

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Mark as dismissed for this session
      sessionStorage.setItem(STORAGE_KEY, 'true')
    }
    setShowModal(open)
  }

  if (isChecking) {
    return null
  }

  return (
    <PasswordSetupModal
      open={showModal}
      onOpenChange={handleOpenChange}
      onSuccess={() => {
        sessionStorage.removeItem(STORAGE_KEY)
      }}
    />
  )
}
