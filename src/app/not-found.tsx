import Navbar from '@/components/navbar'
import { buttonVariants } from '@/components/ui/button'
import Link from 'next/link'

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="min-h-[90vh] p-4 w-full h-full flex flex-col items-center justify-center gap-8">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
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
