import { create } from 'zustand'
import type { User } from '../../../types'
import { TOKEN_KEY } from '../../../constants'

interface AuthState {
  isAuthenticated: boolean
  user: User | null
  token: string | null
  setAuth: (user: User, token: string) => void
  clearAuth: () => void
  setUser: (user: User) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: !!localStorage.getItem(TOKEN_KEY),
  user: null,
  token: localStorage.getItem(TOKEN_KEY),
  setAuth: (user, token) => {
    localStorage.setItem(TOKEN_KEY, token)
    set({ isAuthenticated: true, user, token })
  },
  clearAuth: () => {
    localStorage.removeItem(TOKEN_KEY)
    set({ isAuthenticated: false, user: null, token: null })
  },
  setUser: (user) => set({ user }),
}))