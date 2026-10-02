import { supabase, User } from './supabase'
import { AuthError, Session } from '@supabase/supabase-js'

export interface AuthResponse {
  user: User | null
  session: Session | null
  error: AuthError | null
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  phone?: string
}

class SupabaseAuthService {
  async getCurrentUser(): Promise<User | null> {
    try {
      const sessionData = localStorage.getItem('dazzle_session')
      if (!sessionData) return null
      const session = JSON.parse(sessionData)
      if (!session.user || !session.access_token) return null
      if (Date.now() > session.expires_at) {
        localStorage.removeItem('dazzle_session')
        return null
      }
      return session.user as User
    } catch (error) {
      console.error('Error getting current user:', error)
      localStorage.removeItem('dazzle_session')
      return null
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/login`

      // 30s timeout so loading spinner stays visible on slow connections
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)
      let response: Response
      try {
        response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
          signal: controller.signal,
        })
      } catch (fetchErr: any) {
        clearTimeout(timeoutId)
        const isTimeout = fetchErr?.name === 'AbortError'
        return {
          user: null,
          session: null,
          error: {
            message: isTimeout
              ? 'Request timed out. Please check your internet connection and try again.'
              : 'Connection failed. Please check your internet and try again.',
            name: 'NetworkError',
            status: 0,
          } as AuthError,
        }
      }
      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json()
        return {
          user: null,
          session: null,
          error: { message: errorData.message || 'Login failed', name: 'LoginError', status: response.status } as AuthError,
        }
      }

      const { access_token, user } = await response.json()

      const sessionData = {
        user,
        access_token,
        expires_at: Date.now() + 7 * 24 * 60 * 60 * 1000,
      }
      localStorage.setItem('dazzle_session', JSON.stringify(sessionData))

      const mockSession = {
        access_token,
        refresh_token: access_token,
        expires_in: 7 * 24 * 60 * 60,
        expires_at: Math.floor(sessionData.expires_at / 1000),
        token_type: 'bearer',
        user: { id: user.id, email: user.email, user_metadata: { name: user.name } },
      }

      return { user: user as User, session: mockSession as any, error: null }
    } catch (error) {
      console.error('Login error:', error)
      return {
        user: null,
        session: null,
        error: { message: 'Connection failed. Please check your internet and try again.', name: 'LoginError', status: 500 } as AuthError,
      }
    }
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      // 30s timeout for registration too
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)
      let response: Response
      try {
        response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData),
          signal: controller.signal,
        })
      } catch (fetchErr: any) {
        clearTimeout(timeoutId)
        const isTimeout = fetchErr?.name === 'AbortError'
        return {
          user: null,
          session: null,
          error: {
            message: isTimeout
              ? 'Request timed out. Please check your internet connection and try again.'
              : 'Connection failed. Please check your internet and try again.',
            name: 'NetworkError',
            status: 0,
          } as AuthError,
        }
      }
      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json()
        return {
          user: null,
          session: null,
          error: { message: errorData.message || 'Registration failed', name: 'RegisterError', status: response.status } as AuthError,
        }
      }

      const { user, access_token } = await response.json()

      const sessionData = {
        user,
        access_token,
        expires_at: Date.now() + 7 * 24 * 60 * 60 * 1000,
      }
      localStorage.setItem('dazzle_session', JSON.stringify(sessionData))

      const mockSession = {
        access_token,
        refresh_token: access_token,
        expires_in: 7 * 24 * 60 * 60,
        expires_at: Math.floor(sessionData.expires_at / 1000),
        token_type: 'bearer',
        user: { id: user.id, email: user.email, user_metadata: { name: user.name } },
      }

      return { user: user as User, session: mockSession as any, error: null }
    } catch (error) {
      console.error('Registration error:', error)
      return {
        user: null,
        session: null,
        error: { message: 'Registration failed. Please try again.', name: 'RegisterError', status: 500 } as AuthError,
      }
    }
  }

  async logout(): Promise<{ error: AuthError | null }> {
    try {
      localStorage.removeItem('dazzle_session')
      await supabase.auth.signOut()
      return { error: null }
    } catch (error) {
      console.error('Logout error:', error)
      return { error: { message: 'Logout failed', name: 'LogoutError', status: 500 } as AuthError }
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser()
      return !!user
    } catch {
      return false
    }
  }

  async isAdmin(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser()
      return user?.role === 'ADMIN'
    } catch {
      return false
    }
  }

  async getSession(): Promise<Session | null> {
    try {
      const sessionData = localStorage.getItem('dazzle_session')
      if (!sessionData) return null
      const session = JSON.parse(sessionData)
      if (session.expires_at && Date.now() > session.expires_at) {
        localStorage.removeItem('dazzle_session')
        return null
      }
      return {
        access_token: session.access_token,
        refresh_token: session.access_token,
        expires_in: Math.floor((session.expires_at - Date.now()) / 1000),
        token_type: 'bearer',
        user: session.user,
      } as Session
    } catch (error) {
      console.error('Error getting session:', error)
      return null
    }
  }

  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    const checkAuth = async () => {
      const session = await this.getSession()
      callback(session ? 'SIGNED_IN' : 'SIGNED_OUT', session)
    }
    checkAuth()
    const interval = setInterval(checkAuth, 30000)
    return {
      data: { subscription: { unsubscribe: () => clearInterval(interval) } },
    }
  }
}

export const authService = new SupabaseAuthService()
