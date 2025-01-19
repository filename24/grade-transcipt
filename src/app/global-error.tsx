'use client'

import Image from 'next/image'

export default function RootErrorHandler({
  error
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
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
            font-family: "Wanted Sans Variable", "Wanted Sans", -apple-system, BlinkMacSystemFont, system-ui, "Segoe UI", "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif;
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
          @media (min-width: 1024px) {
            .lg\:w-2\/6 {
              width: 33.333333%;
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
          <h1 style={{ fontSize: '4rem', fontWeight: '600' }}>
            Holyy fu** shit!!
          </h1>
          <p>Something veryyyyyyyy wrong. Pls report this</p>
          <p>
            Error: {error.name}: {error.message} ({error.digest})
          </p>
        </main>
      </body>
    </html>
  )
}
