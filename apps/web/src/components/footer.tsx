'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="pt-4 pb-12">
      <div className="text-balance text-center text-muted-foreground text-sm leading-loose">
        Built by{' '}
        <Link
          href="https://github.com/filename24"
          className="font-medium underline underline-offset-4"
        >
          filename24
        </Link>
        .
        <p className="">
          Copyright © {new Date().getFullYear()} - Knea Project and CrativeLab
        </p>
      </div>
    </footer>
  )
}
