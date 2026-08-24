import { env } from '@/config/env'
import { sleep } from '@/lib/utils'

/**
 * Thin fetch wrapper for the real REST API.
 * Currently unused while USE_MOCK=true, but kept ready so services
 * can switch from mockResolve() to http.get/post/etc without rewriting callers.
 */
class HttpClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private getToken() {
    return typeof window !== 'undefined' ? window.localStorage.getItem('daawatak_token') : null
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken()
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...((options.headers as Record<string, string>) || {}),
    }

    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json'
    }

    const url = path.startsWith('http') ? path : `${this.baseUrl}${path.startsWith('/') ? '' : '/'}${path}`

    const res = await fetch(url, {
      ...options,
      headers,
    })

    if (res.status === 401) {
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.localStorage.removeItem('daawatak_token')
        window.localStorage.removeItem('daawatak_user')
        window.location.href = '/login'
      }
    }

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      const msg = body.message || (body.errors ? Object.values(body.errors).flat().join(', ') : res.statusText)
      throw new ApiError(msg, res.status, body)
    }

    return res.json()
  }

  get<T>(path: string, options?: RequestInit) {
    return this.request<T>(path, { ...options, method: 'GET' })
  }
  post<T>(path: string, data?: unknown, options?: RequestInit) {
    const body = data instanceof FormData ? data : (data !== undefined ? JSON.stringify(data) : undefined)
    return this.request<T>(path, { ...options, method: 'POST', body })
  }
  put<T>(path: string, data?: unknown, options?: RequestInit) {
    const body = data instanceof FormData ? data : (data !== undefined ? JSON.stringify(data) : undefined)
    return this.request<T>(path, { ...options, method: 'PUT', body })
  }
  patch<T>(path: string, data?: unknown, options?: RequestInit) {
    const body = data instanceof FormData ? data : (data !== undefined ? JSON.stringify(data) : undefined)
    return this.request<T>(path, { ...options, method: 'PATCH', body })
  }
  delete<T>(path: string, options?: RequestInit) {
    return this.request<T>(path, { ...options, method: 'DELETE' })
  }
}

export class ApiError extends Error {
  status: number
  body: unknown
  constructor(message: string, status: number, body?: unknown) {
    super(message)
    this.status = status
    this.body = body
  }
}

export const http = new HttpClient(env.apiUrl)

/** Helper used by mock services to simulate network latency & keep the same async contract as `http`. */
export async function mockResolve<T>(data: T, delay: number = env.mockDelayMs): Promise<T> {
  await sleep(delay)
  return data
}
