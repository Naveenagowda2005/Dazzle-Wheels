'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Eye, EyeOff } from 'lucide-react'
import { ClientOnly } from '@/components/client-only'
import { useAuth } from '@/contexts/auth-context'
import toast from 'react-hot-toast'

export default function AdminLoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { login, refreshAuth } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      console.log('🔍 Starting admin login...')
      console.log('📋 Form data:', { email: formData.email, password: '***' })
      
      // Use the auth context login method
      const response = await login({
        email: formData.email,
        password: formData.password
      })

      if (response.error) {
        console.error('❌ Login error:', response.error)
        toast.error(response.error.message || 'Login failed')
        return
      }

      if (response.user?.role === 'ADMIN') {
        console.log('✅ Admin login successful!')
        console.log('📋 User data:', response.user)
        
        toast.success('Admin login successful!')
        
        // Refresh auth state to ensure it's updated
        await refreshAuth()
        
        // Wait a bit for the auth context to update, then redirect
        setTimeout(() => {
          console.log('🔄 Redirecting to admin dashboard...')
          router.push('/admin')
        }, 200)
      } else {
        toast.error('Access denied. Admin privileges required.')
      }

    } catch (error: any) {
      console.error('❌ Admin login error:', error)
      toast.error('Login failed. Please check console for details.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
              <ClientOnly fallback={<div className="w-8 h-8" />}>
                <Shield className="w-8 h-8 text-blue-600" />
              </ClientOnly>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-blue-200">Dazzle Wheels Management System</p>
        </div>

        {/* Login Form */}
        <Card className="shadow-2xl border-0">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl text-center text-gray-800">
              Admin Login
            </CardTitle>
            <p className="text-center text-gray-600">
              Enter your admin credentials to access the dashboard
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Admin Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter admin email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Admin Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter admin password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    <ClientOnly fallback={<div className="w-4 h-4" />}>
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </ClientOnly>
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In to Admin Panel'}
              </Button>
            </form>


            {/* Links */}
            <div className="mt-6 text-center space-y-2">
              <Link 
                href="/login" 
                className="text-sm text-blue-600 hover:text-blue-800 block"
              >
                User Login →
              </Link>
              <Link 
                href="/" 
                className="text-sm text-gray-600 hover:text-gray-800 block"
              >
                ← Back to Website
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-blue-200 text-sm">
            © 2024 Dazzle Wheels. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}