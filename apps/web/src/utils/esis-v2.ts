import { ESISv2Client } from '@gt/esis'

export const esisV2 = new ESISv2Client({
  proxyUrl: process.env.ESIS_V2_PROXY_URL
})

if (process.env.NODE_ENV !== 'production') {
  esisV2.on('debug', (message) => {
    console.debug(`[ESIS v2 DEBUG] ${message}`)
  })
}

export default esisV2
