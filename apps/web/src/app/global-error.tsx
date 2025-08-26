'use client'
import * as Sentry from '@sentry/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect } from 'react'

import { Button, buttonVariants } from '@/components/ui/button'

export default function RootErrorHandler({
  error
}: {
  error: Error & { digest?: string }
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  const handleReload = () => {
    window.location.reload() // Forces a full browser reload
  }
  return (
    <html lang="mn">
      <head>
        <title>FATAL ERROR</title>
        <link
          rel="preconnect"
          href="https://cdn.jsdelivr.net"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/wanteddev/wanted-sans@v1.0.3/packages/wanted-sans/fonts/webfonts/variable/split/WantedSansVariable.min.css"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/wanteddev/wanted-sans@v1.0.3/packages/wanted-sans/fonts/webfonts/variable/split/WantedSansVariable.min.css"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/jgthms/minireset.css@master/minireset.min.css"
        />
        <style>
          {`
                html,body {
                  font-family: font-family: "Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, "Helvetica Neue", "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif;
                  height: auto;
                  min-height: 100vh;
                  width: 100%;
                  max-width: 100vw;
                  background-color: #ffffff;
                  color: #1e1e2e;
                  font-size: 16px;
                }
                
                @media (prefers-color-scheme: dark) {
                  html,body {
                    background-color: #1e1e2e;
                    color: #ffffff;
                  }
                }
                .lg\:w-2\/6 {
                  @media (width >= 64rem /* 1024px */) {
                    width: calc(2/6 * 100%);
                  }
                }
              `}
        </style>
      </head>
      <body>
        <main
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '2rem'
          }}
        >
          <Image
            src={'/ServiceUnavailable.png'}
            alt={'UwU'}
            width={512}
            height={512}
            sizes="100vw"
            className="lg:w-2/6"
          />
          <h1 style={{ fontSize: '4rem', fontWeight: '600' }}>Алдаа гарлаа</h1>
          <p className="text-center">
            Хуудас ачаалахад алдаа гарлаа.
            <br />
            Та дахин оролдоно уу эсвэл эхлэл хуудас руу буцна уу.
          </p>
          <div className="flex gap-4">
            <Button onClick={handleReload}>Дахин оролдох</Button>
            <Link
              href="/dash"
              className={buttonVariants({ variant: 'secondary' })}
            >
              Эхлэл рүү буцах
            </Link>
          </div>
        </main>
      </body>
    </html>
  )
}
