import Navbar from '@/components/navbar'
import { buttonVariants } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="flex h-full min-h-[90vh] w-full flex-col items-center justify-center gap-8 p-4">
        <Image
          src="/NotFound.png"
          alt="Not found"
          width={512}
          height={512}
          sizes="100vw"
          className="lg:w-2/6"
        />
        <p>Уучлаарай, хуудас олдсонгүй</p>

        <Link href="/dash" className={buttonVariants({ variant: 'default' })}>
          Нүүр хуудас руу буцах
        </Link>
      </main>
    </>
  )
}
