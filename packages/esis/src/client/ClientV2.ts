import { AsyncEventEmitter } from '@vladfrangu/async_event_emitter'
import { ESIS_V2_BASE_URL, type RequestHeaders, type ResponseData } from '../'

/**
 * ESIS v2 GET 전용 프록시 클라이언트.
 *
 * v2 호스트(https://hubv2.esis.edu.mn)로의 GET 요청을 인증 불필요 프록시를
 * 통해 대리 수행한다. 프록시에는 `POST { url }` 형태로 전달하지만, 대상
 * v2 요청 자체는 GET 만 지원한다 (POST/PUT/DELETE 미지원).
 */
export class ESISv2Client extends AsyncEventEmitter<ESISv2EventsTypes> {
  public options: ESISv2Options

  constructor(options?: Partial<ESISv2Options>) {
    super()
    this.options = {
      header: {
        'Content-Type': 'application/json'
      },
      ...options
    }
  }

  private get proxyUrl(): string {
    const url = this.options.proxyUrl ?? process.env.ESIS_V2_PROXY_URL
    if (!url) {
      throw new Error('ESIS v2 proxy URL is not configured')
    }

    return url
  }

  private get baseUrl(): string {
    return this.options.baseUrl ?? ESIS_V2_BASE_URL
  }

  /**
   * ESIS v2 GET 요청을 프록시를 통해 수행한다.
   *
   * @param path v2 경로(예: `/svc/api/hub/v2/service/...`) 또는 절대 URL
   * @param params 선택적 쿼리 파라미터. ESIS 규약상 모두 문자열로 전송된다.
   */
  async get<Data extends ResponseData>(
    path: string,
    params?: Record<string, string | number>,
    requestOptions?: RequestInit
  ): Promise<Data['RESULT']> {
    const targetUrl = this.buildUrl(path, params)

    this.emit('debug', `Requesting ${targetUrl} via proxy with method GET`)

    const response = await fetch(this.proxyUrl, {
      ...requestOptions,
      method: 'POST',
      headers: {
        ...this.options.header,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url: targetUrl })
    })

    if (!response.ok) {
      throw new Error(
        `ESIS v2 proxy request failed: ${response.status} ${response.statusText}`
      )
    }

    const data = (await response.json()) as Data & { message?: string }

    if (data.SUCCESS_CODE !== 200 || data.message) {
      throw new Error(
        data.message ?? data.RESPONSE_MESSAGE ?? 'ESIS v2 request failed'
      )
    }

    return data.RESULT
  }

  private buildUrl(
    path: string,
    params?: Record<string, string | number>
  ): string {
    const base = path.startsWith('http') ? path : `${this.baseUrl}${path}`

    if (!params || Object.keys(params).length === 0) {
      return base
    }

    const search = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
      search.append(key, String(value))
    }

    return base.includes('?')
      ? `${base}&${search.toString()}`
      : `${base}?${search.toString()}`
  }
}

export interface ESISv2Options {
  /**
   * 프록시 URL. 미지정 시 `process.env.ESIS_V2_PROXY_URL` 폴백.
   */
  proxyUrl?: string
  /**
   * ESIS v2 호스트. 기본값 `ESIS_V2_BASE_URL`.
   */
  baseUrl?: string
  debug?: boolean
  header: Partial<RequestHeaders>
}

export interface ESISv2EventsTypes {
  error: [error: Error]
  debug: [message: string]
}
