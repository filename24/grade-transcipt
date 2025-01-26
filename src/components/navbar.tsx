'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ChartArea, LogOut, Menu, Moon, Notebook, Sun } from 'lucide-react'
import { Button, buttonVariants } from './ui/button'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import { signOut, useSession } from 'next-auth/react'
import UserMenu from './user-menu'

const Navbar = () => {
  const { setTheme, theme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [isDark, setIsDark] = useState(theme === 'dark')
  const session = useSession()

  const toggleMenu = () => setIsOpen(!isOpen)
  const toggleTheme = () => {
    setIsDark(!isDark)
    setTheme(isDark ? 'light' : 'dark')
  }

  return (
    <nav className="sticky z-50 flex w-full flex-col bg-card text-card-foreground shadow-sm backdrop-blur-lg">
      <div className="flex h-14 items-center">
        <div className="container mx-auto flex max-w-4xl items-center justify-between px-4">
          <Link href="/dash" className="flex items-center gap-x-3">
            <Image width={32} height={32} alt="" src="/knea.png" />
            <span className="font-bold text-lg sm:text-xl">Knea</span>
          </Link>
          <div className={'hidden items-center gap-x-4 md:flex'} id="main-menu">
            <Link href="/dash" className={buttonVariants({ variant: 'ghost' })}>
              Dashboard
            </Link>
            <Link
              href="/dash/grade"
              className={buttonVariants({ variant: 'ghost' })}
            >
              Хичээлийн дүн
            </Link>
          </div>
          <div className="flex items-center gap-x-2 ">
            <UserMenu session={session.data} />
            <Button onClick={toggleTheme} variant="outline" size="icon">
              {isDark ? <Sun /> : <Moon />}
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="block md:hidden"
              onClick={toggleMenu}
            >
              <Menu />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="flex flex-row gap-1 border-t px-5 pt-3 pb-3 sm:px-3">
            <ChartArea size={20} />
            <Link
              href="/dash"
              className="text-center font-medium text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Dashboard
            </Link>
          </div>
          <div className="flex flex-row gap-1 border-t px-5 pt-3 pb-3 sm:px-3">
            <Notebook size={20} />
            <Link
              href="/dash/grade"
              className="text-center font-medium text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Хичээлийн дүн
            </Link>
          </div>
          <div className="flex flex-row gap-1 border-t px-5 pt-3 pb-3 sm:px-3">
            <LogOut size={20} />
            <button
              onClick={() => signOut()}
              className="text-center font-medium text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Гарах
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
