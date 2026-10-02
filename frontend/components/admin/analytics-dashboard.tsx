'use client'

import { useState, useEffect } from 'react'
import { useQuery } from 'react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Car, 
  Calendar, 
  DollarSign,
  BarChart3,
  PieChart,
  MapPin,
  Search,
  Star,
  Activity,
  Target,
  Zap,
  Award,
  Eye,
  Clock
} from 'lucide-react'
import { ClientOnly } from '@/components/client-only'
import api from '@/lib/authenticated-api'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface OverviewData {
  totalCars: number
  totalUsers: number
  totalBookings: number
  totalRevenue: number
  bookingsByStatus: {
    active: number
    completed: number
    pending: number
    cancelled: number
  }
}

interface BookingsAnalytics {
  bookingsByDate: Array<{ date: string; count: number }>
  statusDistribution: Array<{ status: string; count: number }>
}

interface RevenueAnalytics {
  revenueByDate: Array<{ date: string; revenue: number }>
  monthlyComparison: {
    current: number
    previous: number
    growthRate: number
  }
}

interface CarsAnalytics {
  totalCars: number
  availableCars: number
  utilizationRate: number
  fuelTypeDistribution: Array<{ type: string; count: number }>
  brandDistribution: Array<{ brand: string; count: number }>
  averagePrice: number
}

interface PopularCar {
  id: string
  name: string
  brand: string
  pricePerDay: number
  bookingCount: number
  image: string | null
}

export function AnalyticsDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [activeTab, setActiveTab] = useState('overview')

  const { data: overview, isLoading: overviewLoading } = useQuery<OverviewData>(
    'analytics-overview',
    async () => {
      const response = await api.get('/analytics/overview')
      return response.data
    }
  )

  const { data: bookingsAnalytics, isLoading: bookingsLoading } = useQuery<BookingsAnalytics>(
    ['analytics-bookings', selectedPeriod],
    async () => {
      const response = await api.get(`/analytics/bookings?period=${selectedPeriod}`)
      return response.data
    }
  )

  const { data: revenueAnalytics, isLoading: revenueLoading } = useQuery<RevenueAnalytics>(
    ['analytics-revenue', selectedPeriod],
    async () => {
      const response = await api.get(`/analytics/revenue?period=${selectedPeriod}`)
      return response.data
    }
  )

  const { data: carsAnalytics, isLoading: carsLoading } = useQuery<CarsAnalytics>(
    'analytics-cars',
    async () => {
      const response = await api.get('/analytics/cars')
      return response.data
    }
  )

  const { data: popularCars, isLoading: popularCarsLoading } = useQuery<PopularCar[]>(
    'analytics-popular-cars',
    async () => {
      const response = await api.get('/analytics/popular-cars')
      return response.data
    }
  )

  const { data: searchTrends, isLoading: searchTrendsLoading } = useQuery(
    'analytics-search-trends',
    async () => {
      const response = await api.get('/analytics/search-trends')
      return response.data
    }
  )

  const periods = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '1y', label: '1 Year' }
  ]

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
    { id: 'cars', label: 'Cars', icon: Car },
    { id: 'trends', label: 'Trends', icon: TrendingUp }
  ]

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'active':
        return 'from-emerald-500 to-teal-500'
      case 'completed':
        return 'from-blue-500 to-indigo-500'
      case 'pending':
        return 'from-yellow-500 to-orange-500'
      case 'cancelled':
        return 'from-red-500 to-pink-500'
      default:
        return 'from-gray-500 to-slate-500'
    }
  }

  const getStatusColorHex = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'active':
        return '#10B981'
      case 'completed':
        return '#3B82F6'
      case 'pending':
        return '#F59E0B'
      case 'cancelled':
        return '#EF4444'
      default:
        return '#6B7280'
    }
  }

  const StatCard = ({ title, value, subtitle, icon: Icon, trend, trendValue, gradient, delay = 0 }: any) => (
    <Card 
      className={`relative overflow-hidden bg-gradient-to-br ${gradient} text-white shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 animate-slideInUp border-0`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <CardTitle className="text-sm font-medium text-white/90">{title}</CardTitle>
        <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm shadow-lg transform group-hover:rotate-12 transition-transform duration-300">
          <ClientOnly fallback={<div className="h-5 w-5" />}>
            <Icon className="h-5 w-5 text-white" />
          </ClientOnly>
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="text-3xl font-bold text-white mb-2">{value}</div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-white/80">{subtitle}</p>
          {trend && (
            <div className={`flex items-center text-xs font-medium ${
              trend === 'up' ? 'text-emerald-200' : trend === 'down' ? 'text-red-200' : 'text-white/80'
            }`}>
              <ClientOnly fallback={<div className="w-3 h-3 mr-1" />}>
                {trend === 'up' ? (
                  <TrendingUp className="w-3 h-3 mr-1" />
                ) : trend === 'down' ? (
                  <TrendingDown className="w-3 h-3 mr-1" />
                ) : (
                  <Activity className="w-3 h-3 mr-1" />
                )}
              </ClientOnly>
              {trendValue}
            </div>
          )}
        </div>
      </CardContent>
      
      {/* Animated elements */}
      <div className="absolute -top-2 -right-2 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
      <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-white/5 rounded-full blur-lg"></div>
    </Card>
  )

  const ChartCard = ({ title, children, className = "" }: any) => (
    <Card className={`bg-white/80 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}>
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  )

  if (overviewLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="text-lg font-semibold text-gray-700">Loading Analytics Dashboard...</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gradient-to-r from-gray-200 to-gray-300 h-32 rounded-xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gradient-to-r from-gray-200 to-gray-300 h-64 rounded-xl"></div>
          ))}
        </div>
      </div>
    )
  }

  // Debug: Log data to console
  console.log('Analytics Data:', {
    overview,
    bookingsAnalytics,
    revenueAnalytics,
    carsAnalytics,
    popularCars,
    searchTrends
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Comprehensive insights into your business performance</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {periods.map(period => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-white/60 backdrop-blur-sm p-1 rounded-xl border border-white/20">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            <ClientOnly fallback={<div className="w-4 h-4" />}>
              <tab.icon className="w-4 h-4" />
            </ClientOnly>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && overview && (
        <div className="space-y-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Revenue"
              value={formatCurrency(overview.totalRevenue)}
              subtitle="All time earnings"
              icon={DollarSign}
              gradient="from-emerald-600 via-teal-600 to-cyan-600"
              trend={(revenueAnalytics?.monthlyComparison.growthRate || 0) > 0 ? 'up' : 'down'}
              trendValue={`${Math.abs(revenueAnalytics?.monthlyComparison.growthRate || 0).toFixed(1)}%`}
              delay={0}
            />
            <StatCard
              title="Total Bookings"
              value={overview.totalBookings.toLocaleString()}
              subtitle="All time bookings"
              icon={Calendar}
              gradient="from-blue-600 via-indigo-600 to-purple-600"
              trend="up"
              trendValue="+12%"
              delay={150}
            />
            <StatCard
              title="Total Cars"
              value={overview.totalCars.toLocaleString()}
              subtitle="Fleet size"
              icon={Car}
              gradient="from-orange-600 via-red-600 to-pink-600"
              trend="neutral"
              trendValue={`${carsAnalytics?.utilizationRate || 0}% utilized`}
              delay={300}
            />
            <StatCard
              title="Total Users"
              value={overview.totalUsers.toLocaleString()}
              subtitle="Registered customers"
              icon={Users}
              gradient="from-violet-600 via-purple-600 to-pink-600"
              trend="up"
              trendValue="+8%"
              delay={450}
            />
          </div>

          {/* Booking Status Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(overview.bookingsByStatus).map(([status, count], index) => (
              <Card 
                key={status}
                className={`bg-gradient-to-r ${getStatusColor(status)} text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-slideInUp border-0`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold mb-2">{count}</div>
                  <div className="text-sm font-medium capitalize">{status} Bookings</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend */}
            <ChartCard title="Revenue Trend (Last 14 Days)">
              {revenueAnalytics ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueAnalytics.revenueByDate.slice(-14).map(item => ({
                      date: new Date(item.date).getDate(),
                      revenue: item.revenue,
                      formattedDate: formatDate(item.date)
                    }))}>
                      <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#666"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="#666"
                        fontSize={12}
                        tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                      />
                      <Tooltip 
                        formatter={(value: any) => [formatCurrency(value), 'Revenue']}
                        labelFormatter={(label) => `Day ${label}`}
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#3B82F6" 
                        strokeWidth={3}
                        fill="url(#revenueGradient)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center">
                  <div className="text-gray-500">Loading revenue data...</div>
                </div>
              )}
            </ChartCard>

            {/* Popular Cars */}
            <ChartCard title="Top Performing Cars">
              {popularCars && popularCars.length > 0 ? (
                <div className="space-y-3">
                  {popularCars.slice(0, 5).map((car, index) => (
                    <div key={car.id} className="flex items-center space-x-4 p-3 rounded-lg bg-gradient-to-r from-gray-50 to-blue-50 hover:from-blue-50 hover:to-purple-50 transition-all duration-300">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                        #{index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{car.name}</h4>
                        <p className="text-sm text-gray-600">{car.brand} • {formatCurrency(car.pricePerDay)}/day</p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-blue-600">{car.bookingCount}</div>
                        <div className="text-xs text-gray-500">bookings</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center">
                  <div className="text-gray-500">Loading popular cars data...</div>
                </div>
              )}
            </ChartCard>
          </div>
        </div>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && bookingsAnalytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Bookings Over Time (Last 30 Days)">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bookingsAnalytics.bookingsByDate.slice(-30).map(item => ({
                    date: new Date(item.date).getDate(),
                    bookings: item.count,
                    formattedDate: formatDate(item.date)
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#666"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#666"
                      fontSize={12}
                    />
                    <Tooltip 
                      formatter={(value: any) => [value, 'Bookings']}
                      labelFormatter={(label) => `Day ${label}`}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar 
                      dataKey="bookings" 
                      fill="#10B981"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <ChartCard title="Booking Status Distribution">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={bookingsAnalytics.statusDistribution.map((item, index) => ({
                        name: item.status,
                        value: item.count,
                        color: getStatusColor(item.status)
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {bookingsAnalytics.statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getStatusColorHex(entry.status)} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => [value, 'Bookings']}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>
        </div>
      )}

      {/* Revenue Tab */}
      {activeTab === 'revenue' && revenueAnalytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="This Month"
              value={formatCurrency(revenueAnalytics.monthlyComparison.current)}
              subtitle="Current month revenue"
              icon={DollarSign}
              gradient="from-emerald-600 to-teal-600"
            />
            <StatCard
              title="Last Month"
              value={formatCurrency(revenueAnalytics.monthlyComparison.previous)}
              subtitle="Previous month revenue"
              icon={DollarSign}
              gradient="from-blue-600 to-indigo-600"
            />
            <StatCard
              title="Growth Rate"
              value={`${(revenueAnalytics.monthlyComparison.growthRate || 0).toFixed(1)}%`}
              subtitle="Month over month"
              icon={TrendingUp}
              gradient={(revenueAnalytics.monthlyComparison.growthRate || 0) >= 0 ? "from-emerald-600 to-teal-600" : "from-red-600 to-pink-600"}
              trend={(revenueAnalytics.monthlyComparison.growthRate || 0) >= 0 ? 'up' : 'down'}
            />
          </div>

          <ChartCard title="Daily Revenue Trend">
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueAnalytics.revenueByDate.map(item => ({
                  date: new Date(item.date).getDate(),
                  revenue: item.revenue,
                  formattedDate: formatDate(item.date)
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#666"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#666"
                    fontSize={12}
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value: any) => [formatCurrency(value), 'Revenue']}
                    labelFormatter={(label) => `Day ${label}`}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      )}

      {/* Cars Tab */}
      {activeTab === 'cars' && carsAnalytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              title="Total Cars"
              value={carsAnalytics.totalCars.toString()}
              subtitle="Fleet size"
              icon={Car}
              gradient="from-blue-600 to-indigo-600"
            />
            <StatCard
              title="Available"
              value={carsAnalytics.availableCars.toString()}
              subtitle="Ready to rent"
              icon={Target}
              gradient="from-emerald-600 to-teal-600"
            />
            <StatCard
              title="Utilization"
              value={`${carsAnalytics.utilizationRate}%`}
              subtitle="Currently rented"
              icon={Activity}
              gradient="from-orange-600 to-red-600"
            />
            <StatCard
              title="Avg Price"
              value={formatCurrency(carsAnalytics.averagePrice)}
              subtitle="Per day"
              icon={DollarSign}
              gradient="from-purple-600 to-pink-600"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Fuel Type Distribution">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={carsAnalytics.fuelTypeDistribution.map((item, index) => ({
                        name: item.type,
                        value: item.count,
                        color: index === 0 ? '#3B82F6' : '#10B981'
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {carsAnalytics.fuelTypeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#3B82F6' : '#10B981'} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => [value, 'Cars']}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <ChartCard title="Top Brands">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={carsAnalytics.brandDistribution.slice(0, 8)} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" stroke="#666" fontSize={12} />
                    <YAxis 
                      dataKey="brand" 
                      type="category" 
                      stroke="#666" 
                      fontSize={12}
                      width={80}
                    />
                    <Tooltip 
                      formatter={(value: any) => [value, 'Cars']}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar 
                      dataKey="count" 
                      fill="#8B5CF6"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>
        </div>
      )}

      {/* Trends Tab */}
      {activeTab === 'trends' && searchTrends && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Top Search Cities">
              <div className="space-y-3">
                {searchTrends.topCities?.slice(0, 10).map((city: any, index: number) => (
                  <div key={city.city} className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-gray-50 to-purple-50">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex items-center space-x-2">
                        <ClientOnly fallback={<div className="w-4 h-4" />}>
                          <MapPin className="w-4 h-4 text-gray-500" />
                        </ClientOnly>
                        <span className="font-medium">{city.city}</span>
                      </div>
                    </div>
                    <span className="text-purple-600 font-bold">{city.count} searches</span>
                  </div>
                ))}
              </div>
            </ChartCard>

            <ChartCard title="Search Analytics">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-600 mb-2">
                    {searchTrends.totalSearches?.toLocaleString() || 0}
                  </div>
                  <div className="text-gray-600">Total Searches</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {searchTrends.topCities?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Cities Searched</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg">
                    <div className="text-2xl font-bold text-emerald-600 mb-1">
                      {Math.round((searchTrends.totalSearches || 0) / 30)}
                    </div>
                    <div className="text-sm text-gray-600">Daily Average</div>
                  </div>
                </div>
              </div>
            </ChartCard>
          </div>
        </div>
      )}
    </div>
  )
}