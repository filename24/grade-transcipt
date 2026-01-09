'use client'

import { useEffect, useState } from 'react'

import { authClient } from '@/utils/auth-client'

import PasswordSetupModal from './PasswordSetupModal'

const STORAGE_KEY = 'password-setup-dismissed'
const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000 // 2주 (밀리초)

export default function PasswordSetupChecker() {
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const checkPasswordStatus = async () => {
      try {
        // Check if user has dismissed the modal and if it's still valid
        const dismissedData = localStorage.getItem(STORAGE_KEY)

        if (dismissedData) {
          try {
            const { timestamp } = JSON.parse(dismissedData)
            const now = Date.now()
            const timeDiff = now - timestamp

            // If less than 2 weeks have passed, don't show the modal
            if (timeDiff < TWO_WEEKS_MS) {
              return
            }
            // If 2 weeks have passed, remove the old dismissal
            localStorage.removeItem(STORAGE_KEY)
          } catch (e) {
            // Invalid data format, remove it
            localStorage.removeItem(STORAGE_KEY)
          }
        }

        // Check if user has a password
        const result = await authClient.hasPassword()

        if (
          result.data &&
          'hasPassword' in result.data &&
          !result.data.hasPassword
        ) {
          setShowModal(true)
        }
      } catch (error) {
        console.error('Failed to check password status:', error)
      }
    }

    checkPasswordStatus()
  }, [])

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Mark as dismissed with current timestamp
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ timestamp: Date.now() })
      )
    }
    setShowModal(open)
  }

  return (
    <PasswordSetupModal
      open={showModal}
      onOpenChange={handleOpenChange}
      onSuccess={() => {
        // Remove dismissal on successful password setup
        localStorage.removeItem(STORAGE_KEY)
      }}
    />
  )
}
