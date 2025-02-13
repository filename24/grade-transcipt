'use client'

import { useTheme } from 'next-themes'
import { useState } from 'react'
import { Button } from './ui/button'
import { Moon, Sun } from 'lucide-react'

function ThemeSwitcher() {
  const { setTheme, theme } = useTheme()
  const [isDark, setIsDark] = useState(theme === 'dark')

  const toggleTheme = () => {
    setIsDark(!isDark)
    setTheme(isDark ? 'light' : 'dark')
  }

  return (
    <Button onClick={toggleTheme} variant="outline" size="icon">
      {isDark ? <Sun /> : <Moon />}
    </Button>
  )
}

export default ThemeSwitcher
