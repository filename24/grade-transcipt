'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

import { Button } from './ui/button'

function ThemeSwitcher() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" disabled>
        <span className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <Button onClick={toggleTheme} variant="outline" size="icon">
      {resolvedTheme === 'dark' ? <Sun /> : <Moon />}
    </Button>
  )
}

export default ThemeSwitcher
