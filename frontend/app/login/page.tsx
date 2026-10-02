'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Eye, EyeOff, Mail, Lock, Zap } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { login, isAuthenticated, user, loading: authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      router.replace(user.role === 'ADMIN' ? '/admin' : '/')
    }
  }, [authLoading, isAuthenticated, user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await login(formData)
      if (response.error) { toast.error(response.error.message); return }
      if (response.user) { toast.success('Login successful!'); router.replace(response.user.role === 'ADMIN' ? '/admin' : '/'); return }
      toast.error('Login failed. Please try again.')
    } catch (err: any) {
      // Network errors (no internet, timeout, fetch failed)
      if (err?.name === 'TypeError' || err?.message?.includes('fetch') || err?.message?.includes('network') || err?.message?.includes('Failed to fetch')) {
        toast.error('Connection issue. Please check your internet and try again.')
      } else {
        toast.error('Login failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>
      <div className="relative z-10">
        <Header />
        <div className="flex items-center justify-center py-16 px-4">
          <div className="w-full max-w-md">
            {/* Card */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-purple-900/50">
              {/* Logo */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/30">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
                <p className="text-purple-300 mt-1 text-sm">Sign in to your Dazzle Wheels account</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-purple-200">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-purple-400" />
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-purple-400 focus:border-violet-400 focus:ring-violet-400/20"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-purple-200">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-purple-400" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-purple-400 focus:border-violet-400 focus:ring-violet-400/20"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                    <button type="button" className="absolute right-3 top-3 text-purple-400 hover:text-purple-200 transition-colors" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold py-2.5 shadow-lg shadow-purple-500/30 transition-all">
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>

              <div className="mt-6 text-center space-y-3">
                <p className="text-sm text-purple-300">
                  Don&apos;t have an account?{' '}
                  <Link href="/register" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">Sign up</Link>
                </p>
                <div className="border-t border-white/10 pt-3">
                  <Link href="/admin/login" className="text-sm text-pink-400 hover:text-pink-300 font-medium transition-colors">Admin Login →</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  )
}