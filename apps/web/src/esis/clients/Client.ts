import type { If, UserData } from '@/types/ESIS'
import axios, { type AxiosInstance, type RawAxiosRequestHeaders } from 'axios'
import { ESIS_BASE_URL } from '../utils/Constants'

export class ESISClient<Ready extends boolean = boolean> {
  public api: AxiosInstance
  public options: ESISOptions

  public user!: If<Ready, UserData>
  #token: string | null = null
  private _ready: Ready = false as Ready

  constructor(options: Partial<ESISOptions>) {
    this.options = {
      header: {
        'Content-Type': 'application/json',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Whale/3.27.254.15 Safari/537.36'
      },
      ...options
    }

    this.api = axios.create({
      baseURL: `${ESIS_BASE_URL}/api`,
      headers: this.options.header
    })

    if (options.debug) {
      this.api.interceptors.request.use((request) => {
        console.log(
          'Starting Request',
          request.url || request.data ? `${request.url} ${request.data}` : ''
        )
        return request
      })
      this.api.interceptors.response.use((response) => {
        console.log('Response:', response.data)
        return response
      })
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

  public async connect(): Promise<void> {
    const { data } = await axios.request({
      method: 'POST',
      url: `${ESIS_BASE_URL}/signin`,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      data: {
        userName: this.options.username ?? process.env.ESIS_USERNAME,
        password: this.options.password ?? process.env.ESIS_PASSWORD ?? 'asdf'
      }
    })

    if (data.RESULT.academicYear === '-1') throw Error('User not found')

    this.user = data.RESULT
    this._ready = true as Ready
    this.#token = data.RESULT.token
    this.api.defaults.headers.common.Authorization = `Bearer ${this.token}`

    console.log('Logged in successfully with ', process.env.ESIS_USERNAME)
  }
}

export interface ESISOptions {
  username?: string
  password?: string
  debug?: boolean
  header: Partial<RawAxiosRequestHeaders>
}
