import { create } from 'zustand'
import type { User } from '@/types'
import { authService } from '@/services/auth.service'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isInitializing: boolean
  init: () => void
  login: (user: User, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => {
  const session = typeof window !== 'undefined' ? authService.getPersistedSession() : null
  return {
    user: session?.user ?? null,
    token: session?.token ?? null,
    isAuthenticated: !!session,
    isInitializing: false,
    init: () => {
      const current = authService.getPersistedSession()
      if (current) {
        set({ user: current.user, token: current.token, isAuthenticated: true, isInitializing: false })
      } else {
        set({ user: null, token: null, isAuthenticated: false, isInitializing: false })
      }
    },
    login: (user, token) => {
      authService.persistSession(user, token)
      set({ user, token, isAuthenticated: true, isInitializing: false })
    },
    logout: () => {
      authService.clearSession()
      set({ user: null, token: null, isAuthenticated: false, isInitializing: false })
    },
  }
})

