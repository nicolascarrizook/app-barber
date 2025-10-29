import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

/**
 * Authentication state management
 * Handles user session and authentication status
 */

interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'manager' | 'barber' | 'client'
}

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean

  // Actions
  setUser: (user: User | null) => void
  setAccessToken: (token: string | null) => void
  login: (user: User, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        accessToken: null,
        isAuthenticated: false,

        setUser: (user) =>
          set({
            user,
            isAuthenticated: !!user
          }),

        setAccessToken: (token) =>
          set({
            accessToken: token
          }),

        login: (user, token) =>
          set({
            user,
            accessToken: token,
            isAuthenticated: true
          }),

        logout: () =>
          set({
            user: null,
            accessToken: null,
            isAuthenticated: false
          })
      }),
      {
        name: 'auth-storage'
      }
    ),
    { name: 'AuthStore' }
  )
)
