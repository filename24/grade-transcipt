import * as Sentry from '@sentry/nextjs'
import { redis } from '@gt/database'
import { ESISClient } from '@gt/esis'

import { RedisKeys } from './constants'

const RETRY_LIMIT = 5
const RETRY_DELAY = 5000 // milliseconds
const TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000
let attempts = 0

const esis = new ESISClient({
  username: process.env.ESIS_USERNAME,
  password: process.env.ESIS_PASSWORD
})

if (process.env.NODE_ENV !== 'production') {
  esis.on('debug', (message) => {
    console.debug(`[ESIS DEBUG] ${message}`)
  })
}

async function refreshToken() {
  try {
    const newToken = await esis.connect() // 새로운 연결로 토큰 발급
    if (newToken) {
      await redis.set(RedisKeys.esisToken, newToken, {
        ex: TOKEN_EXPIRY / 1000
      })
      return newToken
    }
  } catch (error) {
    Sentry.captureException(error, {
      tags: { feature: 'esis', operation: 'token-refresh' }
    })
    throw error
  }
}

export async function connectEsis() {
  const token = (await redis.get(RedisKeys.esisToken)) as string | null
  try {
    if (token) {
      try {
        return await esis.connect(token)
        // biome-ignore lint/suspicious/noExplicitAny: 오류 예외
      } catch (error: any) {
        if (error.message?.includes('Unauthorized')) {
          esis.emit(
            'debug',
            'Token expired or invalid, attempting to refresh...'
          )
          const newToken = await refreshToken()
          return await esis.connect(newToken)
        }
        throw error
      }
    }
    // 토큰이 없는 경우 새로 발급
    const newToken = await esis.connect()
    if (newToken) {
      await redis.set(RedisKeys.esisToken, newToken, {
        ex: TOKEN_EXPIRY / 1000
      })
    }
    return newToken
  } catch (error) {
    Sentry.captureException(error, {
      tags: { feature: 'esis', operation: 'connection' }
    })
    throw error
  }
}

esis.once('ready', () => {
  console.log('[ESIS] Connected successfully')
  attempts = 0 // Reset attempts on successful connection
})

if (!esis.isReady()) {
  esis.emit('debug', 'ESIS server not ready reconnecting...')
  await connectEsis()
    .then(() => {
      esis.emit('debug', 'ESIS server connected successfully')
    })
    .catch((error) => {
      Sentry.captureException(error, {
        level: attempts >= RETRY_LIMIT ? 'error' : 'warning',
        tags: { feature: 'esis', operation: 'init-connection' },
        extra: {
          attempts,
          maxAttempts: RETRY_LIMIT,
          willRetry: attempts < RETRY_LIMIT
        }
      })
      if (attempts < RETRY_LIMIT) {
        attempts++
        setTimeout(connectEsis, RETRY_DELAY) // Retry after 5 seconds
      }
    })
}

export default esis
