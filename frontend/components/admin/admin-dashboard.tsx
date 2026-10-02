'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Car, 
  Users, 
  Calendar, 
  CreditCard, 
  FileText, 
  Search,
  Gift,
  BarChart3,
  Plus,
  Menu,
  X,
  MessageSquare
} from 'lucide-react'
import { useState } from 'react'
import { useQuery } from 'react-query'
import { ClientOnly } from '@/components/client-only'
import { CarsManagement } from './cars-management'
import { BookingsManagement } from './bookings-management'
import { UsersManagement } from './users-management'
import { BlogsManagement } from './blogs-management'
import { CouponsManagement } from './coupons-management'
import { AnalyticsDashboard } from './analytics-dashboard-simple'
import { QueriesManagement } from './queries-management'
import authenticatedAPI from '@/lib/authenticated-api'

type ActiveTab = 'dashboard' | 'cars' | 'bookings' | 'users' | 'blogs' | 'coupons' | 'analytics' | 'queries'

interface DashboardStats {
  totalCars: number
  availableCars: number
  totalBookings: number
  totalUsers: number
  totalRevenue: number
}

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { data: stats, isLoading: loading, refetch } = useQuery<DashboardStats>(
    'admin-dashboard-stats',
    async () => {
      const [overview, carsData] = await Promise.all([
        authenticatedAPI.get('/analytics/overview'),
        authenticatedAPI.get('/cars?limit=100')
      ])
      const cars = carsData.cars || []
      return {
        totalCars: overview.totalCars || 0,
        availableCars: cars.filter((car: any) => car.availability).length,
        totalBookings: overview.totalBookings || 0,
        totalUsers: overview.totalUsers || 0,
        totalRevenue: overview.totalRevenue || 0
      }
    },
    {
      refetchInterval: 5000,
      refetchOnWindowFocus: true,
      staleTime: 0,
    }
  )

  const defaultStats: DashboardStats = {
    totalCars: 0, availableCars: 0, totalBookings: 0, totalUsers: 0, totalRevenue: 0
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'cars', label: 'Cars', icon: Car },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'blogs', label: 'Blogs', icon: FileText },
    { id: 'coupons', label: 'Coupons', icon: Gift },
    { id: 'analytics', label: 'Analytics', icon: Search },
    { id: 'queries', label: 'Queries', icon: MessageSquare },
  ]

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab)
    setSidebarOpen(false)
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'cars':      return <CarsManagement />
      case 'bookings':  return <BookingsManagement />
      case 'users':     return <UsersManagement />
      case 'blogs':     return <BlogsManagement />
      case 'coupons':   return <CouponsManagement />
      case 'analytics': return <AnalyticsDashboard />
      case 'queries':   return <QueriesManagement />
      default:          return <DashboardOverview loading={loading} stats={stats || defaultStats} onQuickAction={handleTabChange} onRefresh={() => refetch()} />
    }
  }

  const SidebarContent = () => (
    <>
      <div className="p-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Admin Panel</h2>
          <p className="text-sm text-gray-600">Dazzle Wheels</p>
        </div>
        {/* Close button — mobile only */}
        <button
          className="md:hidden p-1 rounded text-gray-500 hover:text-gray-800"
          onClick={() => setSidebarOpen(false)}
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <nav className="mt-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id as ActiveTab)}
              className={`w-full flex items-center px-6 py-3 text-left hover:bg-blue-50 transition-colors ${
                activeTab === item.id
                  ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                  : 'text-gray-700'
              }`}
            >
              <ClientOnly fallback={<div className="w-5 h-5 mr-3" />}>
                <Icon className="w-5 h-5 mr-3" />
              </ClientOnly>
              {item.label}
            </button>
          )
        })}
      </nav>
    </>
  )

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-col w-64 bg-white shadow-lg shrink-0">
        <SidebarContent />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Drawer */}
          <div className="relative w-64 bg-white shadow-xl h-full overflow-y-auto">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-white shadow-sm shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-semibold text-gray-800">
            {menuItems.find(m => m.id === activeTab)?.label || 'Dashboard'}
          </span>
        </div>

        <div className="flex-1 overflow-auto p-4 md:p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}

interface DashboardOverviewProps {
  loading: boolean
  stats: DashboardStats
  onQuickAction: (action: ActiveTab) => void
  onRefresh: () => void
}

interface QuickActionButtonProps {
  icon: any
  label: string
  action: ActiveTab
  variant?: 'default' | 'outline'
  onQuickAction: (action: ActiveTab) => void
}

function QuickActionButton({ icon: Icon, label, action, variant = 'outline', onQuickAction }: QuickActionButtonProps) {
  return (
    <Button
      variant={variant}
      className="h-20 flex flex-col items-center justify-center space-y-2"
      onClick={() => onQuickAction(action)}
    >
      <ClientOnly fallback={<div className="w-6 h-6" />}>
        <Icon className="w-6 h-6" />
      </ClientOnly>
      <span>{label}</span>
    </Button>
  )
}

function DashboardOverview({ loading, stats, onQuickAction }: DashboardOverviewProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <div className="text-sm text-gray-600 hidden sm:block">Welcome to Dazzle Wheels Admin</div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cars</CardTitle>
            <ClientOnly fallback={<div className="h-4 w-4" />}>
              <Car className="h-4 w-4 text-muted-foreground" />
            </ClientOnly>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : (stats?.totalCars ?? 0)}</div>
            <p className="text-xs text-muted-foreground">{stats?.availableCars ?? 0} available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bookings</CardTitle>
            <ClientOnly fallback={<div className="h-4 w-4" />}>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </ClientOnly>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : (stats?.totalBookings ?? 0)}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
            <ClientOnly fallback={<div className="h-4 w-4" />}>
              <Users className="h-4 w-4 text-muted-foreground" />
            </ClientOnly>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : (stats?.totalUsers ?? 0)}</div>
            <p className="text-xs text-muted-foreground">Registered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <ClientOnly fallback={<div className="h-4 w-4" />}>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </ClientOnly>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{loading ? '...' : (stats?.totalRevenue?.toLocaleString() ?? '0')}</div>
            <p className="text-xs text-muted-foreground">Total earnings</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <QuickActionButton icon={Plus}     label="Add New Car"      action="cars"    variant="default"  onQuickAction={onQuickAction} />
            <QuickActionButton icon={FileText} label="Create Blog Post" action="blogs"   variant="outline"  onQuickAction={onQuickAction} />
            <QuickActionButton icon={Gift}     label="Add Coupon"       action="coupons" variant="outline"  onQuickAction={onQuickAction} />
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-green-500 rounded-full shrink-0"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Database initialized</p>
                <p className="text-xs text-gray-500">Sample cars and admin user created</p>
              </div>
              <div className="text-xs text-gray-500 shrink-0">Just now</div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Admin panel accessed</p>
                <p className="text-xs text-gray-500">Welcome to Dazzle Wheels admin</p>
              </div>
              <div className="text-xs text-gray-500 shrink-0">Now</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}