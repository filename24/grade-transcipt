import { UserData } from '@/types/ESIS'
import axios, { RawAxiosRequestHeaders } from 'axios'

export let isLoggedIn = false
export let userData: UserData | null = null

const header: RawAxiosRequestHeaders = {
  'Content-Type': 'application/json',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Whale/3.27.254.15 Safari/537.36'
}

export const api = axios.create({
  baseURL: 'https://svc5.esis.edu.mn/api',
  headers: header
})

// api.interceptors.request.use((request) => {
//   console.log(
//     'Starting Request',
//     request.url + '  ' + request.data ? request.data : ''
//   )
//   return request
// })

// api.interceptors.response.use((response) => {
//   console.log('Response:', response.data)
//   return response
// })

export async function tryLogin() {
  if (isLoggedIn) return

  try {
    const { data } = await axios.request({
      method: 'POST',
      url: 'https://svc5.esis.edu.mn/signin',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      data: {
        userName: process.env.ESIS_USERNAME,
        password: process.env.ESIS_PASSWORD
      }
    })

    userData = data.RESULT
    api.defaults.headers.common['Authorization'] = 'Bearer ' + data.RESULT.token
    isLoggedIn = true
    console.log(
      'Logged in successfully userID:' +
        process.env.ESIS_USERNAME +
        ', token: ' +
        api.defaults.headers.common['Authorization']
    )
    return true
  } catch (error) {
    console.error(error)
    return false
  }
}
