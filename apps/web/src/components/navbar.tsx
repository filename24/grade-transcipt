'use client'

import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type { Session } from 'next-auth'

import { useIsMobile } from '@/hooks/use-mobile'
import { getDDay } from '@/utils'
import { SEMESTER_DATE } from '@/utils/constants'

import ThemeSwitcher from './theme-switcher'
import { Button, buttonVariants } from './ui/button'
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card'
import UserMenu from './user-menu'

const Navbar = ({ session }: { session: Session | null }) => {
  const now = new Date()
  let targetDate = SEMESTER_DATE.HIGH[3].END

  for (const level of [1, 2, 3] as const) {
    const { START, END } = SEMESTER_DATE.HIGH[level]
    if (now < START) {
      targetDate = START
      break
    }
    if (now <= END) {
      targetDate = END
      break
    }
  }

  const isMobile = useIsMobile()
  return (
    <nav className="sticky top-0 z-50 flex w-full flex-col border-b bg-card backdrop-blur supports-[backdrop-filter]:bg-card/80">
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
                  {getDDay(targetDate)}
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
            {isMobile ? null : <UserMenu session={session} />}
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
