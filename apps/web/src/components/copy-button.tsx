'use client'

import * as Sentry from '@sentry/nextjs'
import { Check, Clipboard } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'

interface CopyButtonProps {
  textToCopy: string
  disableDuration?: number // Disable duration (ms)
}

export function CopyButton({
  textToCopy,
  disableDuration = 2000
}: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy)
      toast.success('Амжилттай хууллаа')
      setIsCopied(true)
    } catch (error) {
      Sentry.captureException(error, {
        level: 'warning',
        tags: { feature: 'copy-button', operation: 'clipboard-copy' }
      })
    }
  }

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => {
        setIsCopied(false)
      }, disableDuration)

      return () => clearTimeout(timer)
    }
  }, [isCopied, disableDuration])

  return (
    <Button
      onClick={handleCopy}
      disabled={isCopied}
      size="icon"
      variant="ghost"
      className="size-6"
    >
      {isCopied ? <Check /> : <Clipboard />}
    </Button>
  )
}
