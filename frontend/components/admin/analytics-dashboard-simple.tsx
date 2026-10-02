'use client'

import { useQuery } from 'react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Car, Calendar, DollarSign, TrendingUp, Activity, BarChart3, PieChart as PieIcon } from 'lucide-react'
import { ClientOnly } from '@/components/client-only'

const SUPABASE_URL = 'https://gqrwjafrebbgpvkfphzw.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxcndqYWZyZWJiZ3B2a2ZwaHp3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzY0NDkzMiwiZXhwIjoyMDg5MjIwOTMyfQ.XJA45LBWGiIcQzLRWfM3kMnj_RQ4jt4siTJDTL-6pLk'

async function sbFetch(path: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
  })
  return res.json()
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}

// Mini bar chart using pure CSS/SVG
function BarChart({ data, color = '#8b5cf6', height = 120 }: { data: { label: string; value: number }[]; color?: string; height?: number }) {
  if (!data.length) return <div className="text-slate-400 text-sm text-center py-8">No data</div>
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="flex items-end gap-1 w-full" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
          <div
            className="w-full rounded-t transition-all duration-300 hover:opacity-80"
            style={{ height: `${Math.max((d.value / max) * (height - 20), d.value > 0 ? 4 : 0)}px`, backgroundColor: color }}
          />
          <span className="text-xs text-slate-500 truncate w-full text-center">{d.label}</span>
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
            {d.value}
          </div>
        </div>
      ))}
    </div>
  )
}

// Donut chart using SVG
function DonutChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  if (!total) return <div className="text-slate-400 text-sm text-center py-8">No data</div>
  let offset = 0
  const r = 40, cx = 60, cy = 60, circumference = 2 * Math.PI * r
  return (
    <div className="flex items-center gap-6">
      <svg width="120" height="120" viewBox="0 0 120 120">
        {data.map((d, i) => {
          const pct = d.value / total
          const dash = pct * circumference
          const gap = circumference - dash
          const el = (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={d.color} strokeWidth="18"
              strokeDasharray={`${dash} ${gap}`} strokeDashoffset={-offset * circumference}
              transform="rotate(-90 60 60)" className="transition-all duration-500" />
          )
          offset += pct
          return el
        })}
        <text x="60" y="64" textAnchor="middle" className="text-sm font-bold" fill="#e2e8f0" fontSize="14">{total}</text>
      </svg>
      <div className="space-y-2">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
            <span className="text-slate-300">{d.label}</span>
            <span className="text-white font-semibold ml-auto pl-4">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatCard({ title, value, sub, icon: Icon, gradient }: any) {
  return (
    <div className={`rounded-2xl p-5 bg-gradient-to-br ${gradient} text-white relative overflow-hidden`}>
      <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-xl" />
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-white/80">{title}</p>
        <div className="p-2 bg-white/20 rounded-xl">
          <ClientOnly fallback={<div className="w-4 h-4" />}><Icon className="w-4 h-4" /></ClientOnly>
        </div>
      </div>
      <div className="text-3xl font-bold">{value}</div>
      <p className="text-xs text-white/70 mt-1">{sub}</p>
    </div>
  )
}

export function AnalyticsDashboard() {
  const { data, isLoading } = useQuery('analytics-all', async () => {
    const [cars, bookings, users] = await Promise.all([
      sbFetch('cars?select=id,name,brand,fuel_type,price_per_day,availability'),
      sbFetch('bookings?select=id,booking_status,payment_status,total_price,car_id,created_at'),
      sbFetch('users?select=id,role,created_at'),
    ])
    return { cars, bookings, users }
  }, { staleTime: 30000 })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-2xl bg-white/10 animate-pulse" />)}
        </div>
      </div>
    )
  }

  const cars: any[] = data?.cars || []
  const bookings: any[] = data?.bookings || []
  const users: any[] = data?.users || []

  // Derived stats
  const totalRevenue = bookings.filter(b => b.payment_status === 'PAID').reduce((s, b) => s + (b.total_price || 0), 0)
  const totalUsers = users.filter(u => u.role === 'USER').length
  const availableCars = cars.filter(c => c.availability).length

  // Booking status distribution
  const statusMap: Record<string, number> = {}
  bookings.forEach(b => { const s = b.booking_status || 'UNKNOWN'; statusMap[s] = (statusMap[s] || 0) + 1 })
  const statusColors: Record<string, string> = {
    APPROVED: '#10b981', CONFIRMED: '#10b981', COMPLETED: '#3b82f6',
    PENDING: '#f59e0b', CANCELLED: '#ef4444', UNKNOWN: '#6b7280'
  }
  const statusData = Object.entries(statusMap).map(([label, value]) => ({ label, value, color: statusColors[label] || '#8b5cf6' }))

  // Fuel type distribution
  const fuelMap: Record<string, number> = {}
  cars.forEach(c => { const f = c.fuel_type || 'Unknown'; fuelMap[f] = (fuelMap[f] || 0) + 1 })
  const fuelColors = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']
  const fuelData = Object.entries(fuelMap).map(([label, value], i) => ({ label, value, color: fuelColors[i % fuelColors.length] }))

  // Brand distribution
  const brandMap: Record<string, number> = {}
  cars.forEach(c => { const b = c.brand || 'Unknown'; brandMap[b] = (brandMap[b] || 0) + 1 })
  const brandData = Object.entries(brandMap).sort((a, b) => b[1] - a[1])

  // Bookings by day (last 14 days)
  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - i))
    const ds = d.toISOString().split('T')[0]
    const count = bookings.filter(b => b.created_at?.startsWith(ds)).length
    return { label: d.getDate().toString(), value: count }
  })

  // Revenue by day (last 14 days)
  const revLast14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - i))
    const ds = d.toISOString().split('T')[0]
    const rev = bookings.filter(b => b.created_at?.startsWith(ds) && b.payment_status === 'PAID')
      .reduce((s, b) => s + (b.total_price || 0), 0)
    return { label: d.getDate().toString(), value: rev }
  })

  // Popular cars
  const carBookings: Record<string, number> = {}
  bookings.forEach(b => { if (b.car_id) carBookings[b.car_id] = (carBookings[b.car_id] || 0) + 1 })
  const popularCars = cars.map(c => ({ ...c, count: carBookings[c.id] || 0 })).sort((a, b) => b.count - a.count)

  return (
    <div className="space-y-6 p-1">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Real-time data from your Supabase database</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={fmt(totalRevenue)} sub="From paid bookings" icon={DollarSign} gradient="from-emerald-500 to-teal-600" />
        <StatCard title="Total Bookings" value={bookings.length} sub="All time" icon={Calendar} gradient="from-violet-500 to-purple-600" />
        <StatCard title="Fleet Size" value={cars.length} sub={`${availableCars} available`} icon={Car} gradient="from-orange-500 to-red-500" />
        <StatCard title="Users" value={users.length} sub={`${totalUsers} customers`} icon={Users} gradient="from-blue-500 to-indigo-600" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <ClientOnly fallback={<div className="w-4 h-4" />}><BarChart3 className="w-4 h-4 text-violet-500" /></ClientOnly>
            Bookings — Last 14 Days
          </h3>
          <BarChart data={last14} color="#8b5cf6" height={140} />
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <ClientOnly fallback={<div className="w-4 h-4" />}><Activity className="w-4 h-4 text-emerald-500" /></ClientOnly>
            Revenue — Last 14 Days (₹)
          </h3>
          <BarChart data={revLast14} color="#10b981" height={140} />
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <ClientOnly fallback={<div className="w-4 h-4" />}><PieIcon className="w-4 h-4 text-blue-500" /></ClientOnly>
            Booking Status
          </h3>
          <DonutChart data={statusData} />
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <ClientOnly fallback={<div className="w-4 h-4" />}><PieIcon className="w-4 h-4 text-orange-500" /></ClientOnly>
            Fuel Type Distribution
          </h3>
          <DonutChart data={fuelData} />
        </div>
      </div>

      {/* Cars & Brands */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Top Cars by Bookings</h3>
          {popularCars.length === 0 ? (
            <p className="text-slate-400 text-sm">No cars found</p>
          ) : (
            <div className="space-y-3">
              {popularCars.slice(0, 5).map((car, i) => (
                <div key={car.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-violet-50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{car.name}</p>
                    <p className="text-xs text-gray-500">{car.brand} · {fmt(car.price_per_day)}/day</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-violet-600">{car.count}</p>
                    <p className="text-xs text-gray-400">bookings</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Brand Distribution</h3>
          {brandData.length === 0 ? (
            <p className="text-slate-400 text-sm">No cars found</p>
          ) : (
            <div className="space-y-3">
              {brandData.map(([brand, count], i) => (
                <div key={brand} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{brand}</span>
                      <span className="text-sm font-bold text-blue-600">{count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${(count / cars.length) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <ClientOnly fallback={<div className="w-4 h-4" />}><TrendingUp className="w-4 h-4 text-violet-500" /></ClientOnly>
          Recent Bookings
        </h3>
        {bookings.length === 0 ? (
          <p className="text-slate-400 text-sm">No bookings yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">Booking ID</th>
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">Status</th>
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">Payment</th>
                  <th className="text-right py-2 px-3 text-gray-500 font-medium">Amount</th>
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0, 10).map(b => (
                  <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 px-3 font-mono text-xs text-gray-600">{b.id.slice(0, 8)}...</td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        b.booking_status === 'APPROVED' || b.booking_status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700' :
                        b.booking_status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                        b.booking_status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>{b.booking_status}</span>
                    </td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        b.payment_status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                      }`}>{b.payment_status}</span>
                    </td>
                    <td className="py-2 px-3 text-right font-semibold text-gray-800">{fmt(b.total_price || 0)}</td>
                    <td className="py-2 px-3 text-gray-500 text-xs">{b.created_at ? new Date(b.created_at).toLocaleDateString('en-IN') : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}