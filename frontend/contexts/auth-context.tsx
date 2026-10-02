'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@/lib/supabase'
import { authService, AuthResponse, LoginCredentials, RegisterData } from '@/lib/supabase-auth'
import { Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  login: (credentials: LoginCredentials) => Promise<AuthResponse>
  register: (userData: RegisterData) => Promise<AuthResponse>
  logout: () => Promise<void>
  refreshAuth: () => Promise<void>
  isAuthenticated: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true)
        
        // Get current session
        const currentSession = await authService.getSession()
        setSession(currentSession)
        
        if (currentSession) {
          // Get user data
          const currentUser = await authService.getCurrentUser()
          setUser(currentUser)
          setIsAuthenticated(!!currentUser)
          setIsAdmin(currentUser?.role === 'ADMIN')
          console.log('🔍 Auth initialized with user:', currentUser)
        } else {
          // No session is normal - don't treat as error
          setUser(null)
          setIsAuthenticated(false)
          setIsAdmin(false)
          console.log('🔍 Auth initialized - no session found')
        }
      } catch (error) {
        // Only log errors, don't show to user during initialization
        console.error('Error initializing auth:', error)
        setUser(null)
        setSession(null)
        setIsAuthenticated(false)
        setIsAdmin(false)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Since we're managing our own sessions, we don't need Supabase auth state listener
    // Just return a cleanup function
    return () => {
      // Cleanup if needed
    }
  }, [])

  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    setLoading(true)
    try {
      console.log('🔍 Auth context login started...')
      const response = await authService.login(credentials)
      
      console.log('📋 Auth service response:', response)
      
      if (response.user && response.session) {
        console.log('✅ Setting auth state with user:', response.user)
        setUser(response.user)
        setSession(response.session)
        setIsAuthenticated(true)
        setIsAdmin(response.user.role === 'ADMIN')
        console.log('✅ Auth state updated successfully')
      } else {
        console.log('❌ No user or session in response')
      }
      
      return response
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData: RegisterData): Promise<AuthResponse> => {
    setLoading(true)
    try {
      const response = await authService.register(userData)
      
      if (response.user && response.session) {
        setUser(response.user)
        setSession(response.session)
        setIsAuthenticated(true)
        setIsAdmin(response.user.role === 'ADMIN')
      }
      
      return response
    } finally {
      setLoading(false)
    }
  }

  const logout = async (): Promise<void> => {
    setLoading(true)
    try {
      await authService.logout()
      setUser(null)
      setSession(null)
      setIsAuthenticated(false)
      setIsAdmin(false)
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshAuth = async (): Promise<void> => {
    try {
      console.log('🔄 Refreshing auth state...')
      setLoading(true)
      
      // Get current session
      const currentSession = await authService.getSession()
      setSession(currentSession)
      
      if (currentSession) {
        // Get user data
        const currentUser = await authService.getCurrentUser()
        setUser(currentUser)
        setIsAuthenticated(!!currentUser)
        setIsAdmin(currentUser?.role === 'ADMIN')
        console.log('✅ Auth refreshed with user:', currentUser)
      } else {
        setUser(null)
        setIsAuthenticated(false)
        setIsAdmin(false)
        console.log('🔍 Auth refreshed - no session found')
      }
    } catch (error) {
      console.error('Error refreshing auth:', error)
      setUser(null)
      setSession(null)
      setIsAuthenticated(false)
      setIsAdmin(false)
    } finally {
      setLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    session,
    loading,
    login,
    register,
    logout,
    refreshAuth,
    isAuthenticated,
    isAdmin
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}