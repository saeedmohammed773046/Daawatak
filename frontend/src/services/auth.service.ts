import { http, mockResolve } from '@/lib/http'
import { env } from '@/config/env'
import { currentUser, adminUser, receptionUser } from '@/mocks/users'
import type { User, UserRole } from '@/types'

export interface LoginPayload {
  identifier: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  phone: string
  password: string
}

const TOKEN_KEY = 'daawatak_token'
const USER_KEY = 'daawatak_user'

function mapRole(role: string): UserRole {
  if (role === 'super_admin' || role === 'admin') return 'admin'
  if (role === 'receptionist' || role === 'reception') return 'reception'
  return 'user'
}

function mapUser(u: any): User {
  return {
    id: String(u.id),
    name: u.name,
    email: u.email,
    phone: u.phone,
    avatarUrl: u.avatar_url || u.avatarUrl,
    role: mapRole(u.role),
    planId: u.plan_id || u.planId || 'plan-free',
    createdAt: u.created_at || u.createdAt || new Date().toISOString(),
    status: u.role === 'suspended' ? 'suspended' : 'active',
  }
}

export const authService = {
  async login(payload: LoginPayload): Promise<{ user: User; token: string }> {
    if (env.useMock) {
      const isAdmin = payload.identifier.includes('admin')
      const isReception = payload.identifier.includes('reception')
      const user = isAdmin ? adminUser : isReception ? receptionUser : currentUser
      const token = `mock-token-${Date.now()}`
      return mockResolve({ user, token })
    }

    const res = await http.post<{ success: boolean; data: { access_token: string; user: any } }>('/auth/login', {
      identifier: payload.identifier,
      email: payload.identifier,
      password: payload.password,
    })

    const user = mapUser(res.data.user)
    const token = res.data.access_token
    authService.persistSession(user, token)
    return { user, token }
  },

  async register(payload: RegisterPayload): Promise<{ user: User; token: string; otp_preview?: string }> {
    if (env.useMock) {
      const user: User = {
        ...currentUser,
        id: `u-${Date.now()}`,
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        planId: 'plan-free',
      }
      const token = `mock-token-${Date.now()}`
      return mockResolve({ user, token })
    }

    const res = await http.post<{ success: boolean; message: string; data: { email: string; name: string; otp_preview?: string } }>('/auth/register', {
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      password: payload.password,
    })

    // If backend auto-created or provided OTP, we can also auto-verify or proceed to verify screen
    const user: User = {
      id: `pending-${Date.now()}`,
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      role: 'user',
      planId: 'plan-free',
      createdAt: new Date().toISOString(),
      status: 'active',
    }

    return { user, token: '', otp_preview: res.data?.otp_preview }
  },

  async verifyOtp(payload: { email: string; otp: string }): Promise<{ user: User; token: string }> {
    if (env.useMock) {
      return mockResolve({ user: currentUser, token: `mock-token-${Date.now()}` })
    }

    const res = await http.post<{ success: boolean; data: { access_token: string; user: any } }>('/auth/verify-otp', payload)
    const user = mapUser(res.data.user)
    const token = res.data.access_token
    authService.persistSession(user, token)
    return { user, token }
  },

  async resendOtp(email: string): Promise<{ success: boolean; otp_preview?: string }> {
    if (env.useMock) return mockResolve({ success: true })
    const res = await http.post<{ success: boolean; data: { otp_preview?: string } }>('/auth/resend-otp', { email })
    return { success: true, otp_preview: res.data?.otp_preview }
  },

  async forgotPassword(email: string): Promise<{ sent: boolean }> {
    if (env.useMock) return mockResolve({ sent: true })
    await http.post('/auth/forgot-password', { email })
    return { sent: true }
  },

  async resetPassword(token: string, password: string, email?: string): Promise<{ success: boolean }> {
    if (env.useMock) return mockResolve({ success: true })
    await http.post('/auth/reset-password', { token, password, password_confirmation: password, email })
    return { success: true }
  },

  async verifyAccount(code: string, email?: string): Promise<{ verified: boolean }> {
    if (env.useMock) return mockResolve({ verified: true })
    if (email) {
      await authService.verifyOtp({ email, otp: code })
      return { verified: true }
    }
    return { verified: true }
  },

  async me(): Promise<User | null> {
    if (env.useMock) return mockResolve(currentUser)
    try {
      const res = await http.get<{ success: boolean; data: { user: any } }>('/auth/me')
      return mapUser(res.data.user)
    } catch {
      return null
    }
  },

  persistSession(user: User, token: string) {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(TOKEN_KEY, token)
    window.localStorage.setItem(USER_KEY, JSON.stringify(user))
  },

  getPersistedSession(): { user: User; token: string } | null {
    if (typeof window === 'undefined') return null
    const token = window.localStorage.getItem(TOKEN_KEY)
    const userRaw = window.localStorage.getItem(USER_KEY)
    if (!token || !userRaw) return null
    try {
      return { token, user: JSON.parse(userRaw) as User }
    } catch {
      return null
    }
  },

  clearSession() {
    if (typeof window === 'undefined') return
    window.localStorage.removeItem(TOKEN_KEY)
    window.localStorage.removeItem(USER_KEY)
  },
}

