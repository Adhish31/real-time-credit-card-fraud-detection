import { create } from 'zustand'
import { persist } from 'zustand/middleware'

function applyTheme(theme) {
  const root = document.documentElement
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const isDark = theme === 'dark' || (theme === 'system' && systemDark)
  root.classList.toggle('dark', isDark)
}

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'system',
      setTheme: (theme) => {
        applyTheme(theme)
        set({ theme })
      },
      initializeTheme: () => applyTheme(get().theme),
    }),
    { name: 'fraudguard-theme' },
  ),
)
