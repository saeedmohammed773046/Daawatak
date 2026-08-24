import { create } from 'zustand'

export type ThemeMode = 'light' | 'dark' | 'system'

interface UiState {
  theme: ThemeMode
  sidebarOpen: boolean
  setTheme: (theme: ThemeMode) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
}

const THEME_KEY = 'daawatak_theme'

function applyTheme(theme: ThemeMode) {
  const root = document.documentElement
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  root.classList.toggle('dark', isDark)
}

export const useUiStore = create<UiState>((set) => ({
  theme: (typeof window !== 'undefined' && (window.localStorage.getItem(THEME_KEY) as ThemeMode)) || 'light',
  sidebarOpen: false,
  setTheme: (theme) => {
    window.localStorage.setItem(THEME_KEY, theme)
    applyTheme(theme)
    set({ theme })
  },
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}))

export function initTheme() {
  const saved = (typeof window !== 'undefined' && (window.localStorage.getItem(THEME_KEY) as ThemeMode)) || 'light'
  applyTheme(saved)
}
