'use client'

import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { AdminDashboard } from '@/components/admin/admin-dashboard'
import { AdminGuard } from '@/components/admin/admin-guard'

export default function AdminPage() {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-slate-400/20 to-gray-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-zinc-400/20 to-slate-400/20 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
        </div>
        
        <div className="relative z-10">
          <Header />
          <AdminDashboard />
          <Footer />
        </div>
      </div>
    </AdminGuard>
  )
}