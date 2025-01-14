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
    <nav className="sticky w-full z-50 flex flex-col backdrop-blur-lg bg-card text-card-foreground shadow">
      <div className="flex items-center h-14">
        <div className="px-4 container max-w-4xl mx-auto flex justify-between items-center">
          <Link href="/dash" className="flex items-center gap-x-3">
            <Image width={32} height={32} alt="" src="/knea.png" />
            <span className="font-bold text-lg sm:text-xl">Knea</span>
          </Link>
          <div className={'hidden md:flex gap-x-4 items-center'} id="main-menu">
            <Link href="/dash" className={buttonVariants({ variant: 'ghost' })}>
              Dashboard
            </Link>
            <Link
              href="/grade"
              className={buttonVariants({ variant: 'ghost' })}
            >
              Хичээлийн дүн
            </Link>
          </div>
          <div className="flex gap-x-2 items-center ">
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
          <div className="flex flex-row gap-1  px-5 pt-3 pb-3 sm:px-3 border-t">
            <ChartArea size={20} />
            <Link
              href="/dash"
              className="text-center text-sm hover:bg-gray-100 dark:hover:bg-gray-700 font-medium"
            >
              Dashboard
            </Link>
          </div>
          <div className="flex flex-row gap-1  px-5 pt-3 pb-3 sm:px-3 border-t">
            <Notebook size={20} />
            <Link
              href="/grade"
              className="text-center text-sm hover:bg-gray-100 dark:hover:bg-gray-700 font-medium"
            >
              Хичээлийн дүн
            </Link>
          </div>
          <div className="flex flex-row gap-1  px-5 pt-3 pb-3 sm:px-3 border-t">
            <LogOut size={20} />
            <button
              onClick={() => signOut()}
              className="text-center text-sm hover:bg-gray-100 dark:hover:bg-gray-700 font-medium"
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
