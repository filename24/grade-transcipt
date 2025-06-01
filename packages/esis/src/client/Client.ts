import { decodeJwt } from 'jose'
import { type If, type TokenData, ESIS_BASE_URL, type ResponseData } from '../'

export class ESISClient<Ready extends boolean = boolean> {
  public options: ESISOptions

  public data!: If<Ready, TokenData>
  #token: string | null = null
  private _ready: Ready = false as Ready

  constructor(options: Partial<ESISOptions>) {
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
      const response = await fetch(
        `${ESIS_BASE_URL}/svc/api/hub/organization/info`
      )

      if (response.status === 401) {
        console.warn('Unauthorized regenerating token...')
      } else {
        const data = await response.json()
        if (data.SUCCESS_CODE === 200) {
          const { iat, exp, ...tokenData } = decodeJwt<TokenData>(token)
          // biome-ignore lint/suspicious/noExplicitAny: <explanation>
          this.data = tokenData as any
          this.#token = token
          this._ready = true as Ready

          return token
        }
      }
    }

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
    this.data = data.result

    return data.token
  }

  async get<Data extends ResponseData>(url: string) {
    return this.request<Data>(url, {
      method: 'GET'
    })
  }

  async post<Data extends ResponseData>(
    url: string,
    body: Record<string, string>
  ): Promise<Data['RESULT']> {
    return this.request<Data>(url, {
      body,
      method: 'POST'
    })
  }

  async put<Data extends ResponseData>(
    url: string,
    body: Record<string, string>
  ): Promise<Data['RESULT']> {
    return this.request<Data>(url, {
      body,
      method: 'PUT'
    })
  }

  async delete<Data extends ResponseData>(
    url: string,
    body: Record<string, string>
  ): Promise<Data['RESULT']> {
    return this.request<Data>(url, {
      body,
      method: 'DELETE'
    })
  }

  async request<Data extends ResponseData>(
    url: string,
    options: {
      body?: Record<string, string>
      method: 'GET' | 'POST' | 'PUT' | 'DELETE'
    }
  ): Promise<Data['RESULT']> {
    let reslovedURL = ''
    if (!url.startsWith(ESIS_BASE_URL)) {
      reslovedURL = `${ESIS_BASE_URL}${url}`
    } else {
      reslovedURL = url
    }

    const response = await fetch(reslovedURL, {
      method: options.method,
      headers: {
        ...this.options.header,
        Authorization: this.token
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    })

    if (!response.ok) {
      throw new Error(
        `Request failed with status ${response.status} - ${response.statusText}`
      )
    }

    const data = (await response.json()) as Data

    if (data.SUCCESS_CODE !== 200) {
      throw new Error(`Request failed with message: ${data.RESPONSE_MESSAGE}`)
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
