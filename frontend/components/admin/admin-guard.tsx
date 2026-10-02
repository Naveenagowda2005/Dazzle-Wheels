'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { Shield, AlertCircle } from 'lucide-react'
import { ClientOnly } from '@/components/client-only'

interface AdminGuardProps {
  children: React.ReactNode
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { user, isAuthenticated, isAdmin, loading } = useAuth()
  const router = useRouter()

  // Debug logging
  useEffect(() => {
    console.log('🔍 AdminGuard state:', {
      loading,
      isAuthenticated,
      isAdmin,
      user: user ? { name: user.name, email: user.email, role: user.role } : null
    })
  }, [loading, isAuthenticated, isAdmin, user])

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      console.log('🔄 AdminGuard: Redirecting to login (not authenticated)')
      router.push('/admin/login')
    }
  }, [loading, isAuthenticated, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <ClientOnly fallback={<div className="w-8 h-8 mx-auto mb-4" />}>
            <Shield className="w-8 h-8 text-blue-600 mx-auto mb-4 animate-pulse" />
          </ClientOnly>
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <ClientOnly fallback={<div className="w-16 h-16 mx-auto mb-4" />}>
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          </ClientOnly>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-6">
            Please log in with admin credentials to access this area.
          </p>
          <div className="space-y-3">
            <Link 
              href="/admin/login"
              className="block w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Admin Login
            </Link>
            <Link 
              href="/"
              className="block w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Back to Website
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <ClientOnly fallback={<div className="w-16 h-16 mx-auto mb-4" />}>
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          </ClientOnly>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You need administrator privileges to access this area.
          </p>
          <div className="space-y-3">
            <Link 
              href="/admin/login"
              className="block w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Admin Login
            </Link>
            <Link 
              href="/"
              className="block w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Back to Website
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}