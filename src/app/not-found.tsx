import Navbar from '@/components/navbar'
import { buttonVariants } from '@/components/ui/button'
import Link from 'next/link'

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="flex h-full min-h-[90vh] w-full flex-col items-center justify-center gap-8 p-4">
        <h1 className="scroll-m-20 font-extrabold text-4xl tracking-tight lg:text-5xl">
          404
        </h1>
        <p>Уучлаарай, хуудас олдсонгүй</p>

        <Link href="/dash" className={buttonVariants({ variant: 'default' })}>
          Нүүр хуудас руу буцах
        </Link>
      </main>
    </>
  )
}
