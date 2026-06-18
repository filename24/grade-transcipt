import { AsyncEventEmitter } from '@vladfrangu/async_event_emitter'
import { decodeJwt } from 'jose'
import {
  type ClientEventsTypes,
  ESIS_BASE_URL,
  type If,
  type ResponseData,
  type TokenData
} from '../'

export class ESISClient<
  Ready extends boolean = boolean
> extends AsyncEventEmitter<ClientEventsTypes> {
  public options: ESISOptions

  public data!: If<Ready, TokenData>
  #token: string | null = null
  private _ready: Ready = false as Ready

  constructor(options: Partial<ESISOptions>) {
    super()
    this.options = {
      header: {
        'Content-Type': 'application/json'
      },
      ...options
    }
  }

  public get token(): string {
    if (!this.#token) {
      throw new Error('Token has not been set')
    }

    return this.#token
  }

  public isReady(): this is ESISClient<true> {
    return this._ready
  }

  public async connect(token?: string): Promise<string> {
    if (token) {
      this.emit('debug', 'Connecting with provided token...')
      this.emit('debug', `Provided token: ${token}`)

      const response = await fetch(
        `${ESIS_BASE_URL}/svc/api/hub/organization/info`,
        {
          headers: {
            ...this.options.header,
            Authorization: `Bearer ${token}`
          },
          method: 'GET',
          cache: 'force-cache'
        }
      )

      if (response.status === 401) {
        this.emit('debug', 'Unauthorized regenerating token...')
      } else {
        const data = await response.json()
        if (data.SUCCESS_CODE === 200) {
          const { iat, exp, ...tokenData } = decodeJwt<TokenData>(token)

          this.emit(
            'debug',
            'Client received organization info. Marking as fully ready.'
          )
          this.data = tokenData as any
          this.#token = token
          this._ready = true as Ready

          if (this.isReady()) this.emit('ready', this)

          return token
        }
      }
    }

    this.emit('debug', 'Connecting without provided token...')
    this.emit(
      'debug',
      `Using username: ${this.options.username} and password: ${this.options.password}`
    )
    const response = await fetch(`${ESIS_BASE_URL}/svc/api/login`, {
      method: 'POST',
      headers: this.options.header as Record<string, string>,
      body: JSON.stringify({
        username: this.options.username,
        password: this.options.password
      })
    })

    if (response.status === 401)
      throw new Error('Unauthorized, please check your credentials')

    const data = await response.json()

    this.#token = data.token
    this._ready = true as Ready
    this.emit(
      'debug',
      'Client received organization info. Marking as fully ready.'
    )
    this.data = data.result

    if (this.isReady()) this.emit('ready', this)
    return data.token
  }

  async get<Data extends ResponseData>(
    url: string,
    requestOptions?: RequestInit
  ) {
    return this.request<Data>(url, {
      method: 'GET',
      requestOptions
    })
  }

  async post<Data extends ResponseData>(
    url: string,
    body: Record<string, string>,
    requestOptions?: RequestInit
  ): Promise<Data['RESULT']> {
    return this.request<Data>(url, {
      body,
      method: 'POST',
      requestOptions
    })
  }

  async put<Data extends ResponseData>(
    url: string,
    body: Record<string, string>,
    requestOptions?: RequestInit
  ): Promise<Data['RESULT']> {
    return this.request<Data>(url, {
      body,
      method: 'PUT',
      requestOptions
    })
  }

  async delete<Data extends ResponseData>(
    url: string,
    body: Record<string, string>,
    requestOptions?: RequestInit
  ): Promise<Data['RESULT']> {
    return this.request<Data>(url, {
      body,
      method: 'DELETE',
      requestOptions
    })
  }

  async request<Data extends ResponseData>(
    url: string,
    options: {
      body?: Record<string, string>
      method: 'GET' | 'POST' | 'PUT' | 'DELETE'
      requestOptions?: RequestInit
    }
  ): Promise<Data['RESULT']> {
    let reslovedURL = ''
    if (!url.startsWith(ESIS_BASE_URL)) {
      reslovedURL = `${ESIS_BASE_URL}${url}`
    } else {
      reslovedURL = url
    }

    this.emit(
      'debug',
      `Requesting ${reslovedURL} with method ${options.method}`
    )
    const response = await fetch(reslovedURL, {
      ...options.requestOptions,
      method: options.method,
      headers: {
        ...this.options.header,
        Authorization: `Bearer ${this.token}`
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    })

    if (!response.ok) {
      throw new Error(
        `Request failed with status ${response.status} - ${response.statusText}`
      )
    }

    const data = (await response.json()) as Data & { message?: string }

    // ESIS는 오류도 HTTP 200 + 에러 엔벨로프로 내려주는 경우가 있어
    // SUCCESS_CODE/메시지를 검증하지 않으면 RESULT가 조용히 undefined로 샌다.
    // (ClientV2와 동일한 안전장치)
    if (data.SUCCESS_CODE !== 200 || data.message) {
      throw new Error(
        data.message ?? data.RESPONSE_MESSAGE ?? 'ESIS request failed'
      )
    }

    return data.RESULT
  }
}

export interface ESISOptions {
  username?: string
  password?: string
  debug?: boolean
  header: Partial<RequestHeaders>
}

export type RequestHeaders = {
  [x: string]: string | undefined
  Accept?: string | undefined
  'Content-Length'?: string | undefined
  'User-Agent'?: string | undefined
  'Content-Encoding'?: string | undefined
  Authorization?: string | undefined
  'Content-Type'?: string | undefined
}
