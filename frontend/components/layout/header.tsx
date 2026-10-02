'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Menu, X, User, LogOut, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { ClientOnly } from '@/components/client-only'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()
  const { user, isAuthenticated, isAdmin, logout, loading } = useAuth()

  const handleLogout = async () => {
    await logout()
    router.push(user?.role === 'ADMIN' ? '/admin/login' : '/')
  }

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/cars', label: 'Cars' },
    { href: '/blog', label: 'Blog' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ]

  return (
    <header className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 border-b border-purple-800/50 sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-105 transition-transform">
              <ClientOnly fallback={<span className="text-white font-bold text-lg">D</span>}>
                <Zap className="w-5 h-5 text-white" />
              </ClientOnly>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">Dazzle Wheels</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="px-4 py-2 rounded-lg text-purple-200 hover:text-white hover:bg-white/10 transition-all text-sm font-medium">
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Auth */}
          <div className="hidden md:flex items-center space-x-3">
            {loading ? null : isAuthenticated ? (
              <>
                <Link href="/dashboard" className="flex items-center space-x-2 text-purple-200 hover:text-white transition-colors text-sm">
                  <ClientOnly fallback={<div className="w-4 h-4" />}>
                    <User className="w-4 h-4" />
                  </ClientOnly>
                  <span>{user?.name}</span>
                </Link>
                {isAdmin && (
                  <Link href="/admin" className="px-3 py-1.5 rounded-lg bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 text-sm font-medium border border-violet-500/30 transition-all">
                    Admin Panel
                  </Link>
                )}
                <Button size="sm" onClick={handleLogout} className="bg-white/10 hover:bg-white/20 text-white border border-white/20">
                  <ClientOnly fallback={<div className="w-4 h-4 mr-1" />}>
                    <LogOut className="w-4 h-4 mr-1" />
                  </ClientOnly>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-purple-200 hover:text-white hover:bg-white/10">Login</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg shadow-purple-500/30">Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden text-purple-200 hover:text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <ClientOnly fallback={<div className="w-6 h-6" />}>
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </ClientOnly>
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-purple-800/50">
            <nav className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="px-4 py-2 rounded-lg text-purple-200 hover:text-white hover:bg-white/10 transition-all text-sm" onClick={() => setIsMenuOpen(false)}>
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-purple-800/50 mt-2 space-y-2">
                {isAuthenticated ? (
                  <>
                    <Link href="/dashboard" className="block px-4 py-2 text-purple-200 hover:text-white text-sm" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                    {isAdmin && <Link href="/admin" className="block px-4 py-2 text-violet-300 hover:text-white text-sm font-medium" onClick={() => setIsMenuOpen(false)}>Admin Panel</Link>}
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-red-400 hover:text-red-300 text-sm">Logout</button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setIsMenuOpen(false)}><Button variant="ghost" size="sm" className="w-full text-purple-200 hover:text-white hover:bg-white/10">Login</Button></Link>
                    <Link href="/register" onClick={() => setIsMenuOpen(false)}><Button size="sm" className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white">Sign Up</Button></Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}