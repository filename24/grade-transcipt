'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ChartArea, LogOut, Menu, Notebook } from 'lucide-react'
import { Button, buttonVariants } from './ui/button'
import Image from 'next/image'
import { signOut } from 'next-auth/react'
import UserMenu from './user-menu'
import type { Session } from 'next-auth'
import { getCurrentSemesters, getDDay } from '@/utils'
import { SEMESTER_DATE } from '@/utils/constants'
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card'
import ThemeSwitcher from './theme-switcher'

const Navbar = ({ session }: { session: Session | null }) => {
  const semesterDate = SEMESTER_DATE.HIGH[getCurrentSemesters().HIGH || 1]
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)

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
            <Link
              href="/dash/record"
              className={buttonVariants({ variant: 'ghost' })}
            >
              Хувийн хэргийн дүн
            </Link>
          </div>
          <div className="flex items-center gap-x-2 ">
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button
                  variant={'ghost'}
                  className="font-extrabold text-muted-foreground"
                >
                  {getDDay(semesterDate.END)}
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-auto">
                <ul className="m-3 list-disc font-medium text-sm leading-none [&>li]:mt-1">
                  <li>
                    1-р улирал амралт - {getDDay(SEMESTER_DATE.HIGH[1].END)}
                  </li>
                  <li>
                    2-р улирал амралт - {getDDay(SEMESTER_DATE.HIGH[2].END)}
                  </li>
                  <li>
                    Жилийн эцэсийн амралт - {getDDay(SEMESTER_DATE.HIGH[3].END)}
                  </li>
                </ul>
                <Link
                  href={'#'}
                  className="flex flex-row gap-1 text-center text-muted-foreground text-xs"
                >
                  Дэлгэрэнгүй харах <ArrowRight size={20} />
                </Link>
              </HoverCardContent>
            </HoverCard>
            <UserMenu session={session} />
            <ThemeSwitcher />

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
          <Link
            href="/dash"
            className="flex flex-row gap-1 border-t px-5 pt-3 pb-3 sm:px-3"
          >
            <ChartArea size={20} />
            <p className="text-center font-medium text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
              Dashboard
            </p>
          </Link>
          <Link
            href="/dash/grade"
            className="flex flex-row gap-1 border-t px-5 pt-3 pb-3 sm:px-3"
          >
            <Notebook size={20} />
            <p className="text-center font-medium text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
              Хичээлийн дүн
            </p>
          </Link>
          <Link
            href="/dash/record"
            className="flex flex-row gap-1 border-t px-5 pt-3 pb-3 sm:px-3"
          >
            <Notebook size={20} />
            <p className="text-center font-medium text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
              Хувийн хэргийн дүн
            </p>
          </Link>
          <Button
            onClick={() => signOut()}
            className="flex w-full flex-row gap-1 border-t px-5 pt-3 pb-3 sm:px-3"
          >
            <LogOut size={20} />
            <p className="text-center font-medium text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
              Гарах
            </p>
          </Button>
        </div>
      )}
    </nav>
  )
}

export default Navbar
