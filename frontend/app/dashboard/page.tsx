'use client'

import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { UserDashboard } from '@/components/dashboard/user-dashboard'

export default function DashboardPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <UserDashboard />
      <Footer />
    </div>
  )
}
