content = """\
'use client'

import { useQuery } from 'react-query'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Car, Calendar, Clock, CheckCircle, XCircle, AlertCircle, Loader2, LogOut, CreditCard } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
const RAZORPAY_KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || ''

function getToken() {
  try {
    const s = localStorage.getItem('dazzle_session')
    if (!s) return null
    const parsed = JSON.parse(s)
    if (parsed.access_token && parsed.expires_at > Date.now()) return parsed.access_token
  } catch {}
  return null
}

async function fetchMyBookings() {
  const token = getToken()
  if (!token) throw new Error('Not authenticated')
  const res = await fetch(API_URL + '/bookings', { headers: { Authorization: 'Bearer ' + token } })
  if (!res.ok) throw new Error('Failed to fetch bookings')
  return res.json()
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

type StatusKey = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'

interface StatusConfig { label: string; color: string; message: string; iconType: string }

const STATUS_CONFIG: Record<StatusKey, StatusConfig> = {
  PENDING: {
    label: 'Pending Approval',
    color: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
    message: 'Your driving license is being reviewed. We will notify you once approved.',
    iconType: 'alert',
  },
  APPROVED: {
    label: 'Approved - Pay Now',
    color: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    message: 'Your booking is approved! Complete payment to confirm your booking.',
    iconType: 'check',
  },
  REJECTED: {
    label: 'Rejected',
    color: 'bg-red-500/20 text-red-300 border border-red-500/30',
    message: 'Your booking was rejected. Please contact us for more information.',
    iconType: 'x',
  },
  CONFIRMED: {
    label: 'Confirmed',
    color: 'bg-green-500/20 text-green-300 border border-green-500/30',
    message: 'Booking confirmed and payment received. See you at pickup!',
    iconType: 'check',
  },
  COMPLETED: {
    label: 'Completed',
    color: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
    message: 'Thank you for choosing Dazzle Wheels. Hope you enjoyed the ride!',
    iconType: 'check',
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
    message: 'This booking has been cancelled.',
    iconType: 'x',
  },
}

export function UserDashboard() {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth()
  const router = useRouter()
  const [payingId, setPayingId] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login')
  }, [authLoading, isAuthenticated, router])

  const { data, isLoading, isError, refetch } = useQuery(['my-bookings'], fetchMyBookings, {
    enabled: isAuthenticated,
    refetchInterval: 10000,
    staleTime: 0,
  })

  const bookings: any[] = (data?.bookings || []) as any[]

  const handlePayNow = async (booking: any) => {
    setPayingId(booking.id)
    try {
      const token = getToken()
      const res = await fetch(API_URL + '/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ bookingId: booking.id }),
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err.message || 'Failed to create payment order')
        return
      }
      const order = await res.json()
      const options = {
        key: RAZORPAY_KEY,
        amount: order.amount,
        currency: order.currency,
        name: 'Dazzle Wheels',
        description: 'Car Rental - ' + (booking.car?.name || ''),
        order_id: order.orderId,
        handler: async (response: any) => {
          const verifyRes = await fetch(API_URL + '/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
            body: JSON.stringify({
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
              bookingId: booking.id,
            }),
          })
          if (verifyRes.ok) {
            alert('Payment successful! Your booking is confirmed.')
            refetch()
          } else {
            alert('Payment verification failed. Please contact support.')
          }
        },
        prefill: { name: user?.name || '', email: user?.email || '' },
        theme: { color: '#6d28d9' },
      }
      const rzp = new (window as any).Razorpay(options)
      rzp.open()
    } catch (e) {
      alert('Payment failed. Please try again.')
    } finally {
      setPayingId(null)
    }
  }

  if (authLoading || (!isAuthenticated && !authLoading)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-violet-900 to-indigo-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-300 animate-spin" />
      </div>
    )
  }

  return (
    <>
      <script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-violet-900 to-indigo-950 py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">My Dashboard</h1>
              <p className="text-purple-300 mt-1">Welcome back, {user?.name || user?.email}</p>
            </div>
            <button
              onClick={async () => { await logout(); router.push('/') }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total',     value: bookings.length, color: 'from-purple-600 to-violet-600' },
              { label: 'Pending',   value: bookings.filter((b: any) => b.bookingStatus === 'PENDING').length,   color: 'from-yellow-600 to-orange-600' },
              { label: 'Approved',  value: bookings.filter((b: any) => b.bookingStatus === 'APPROVED').length,  color: 'from-blue-600 to-cyan-600' },
              { label: 'Confirmed', value: bookings.filter((b: any) => b.bookingStatus === 'CONFIRMED').length, color: 'from-green-600 to-emerald-600' },
            ].map((stat) => (
              <div key={stat.label} className={'bg-gradient-to-br ' + stat.color + ' rounded-xl p-4 text-white'}>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm opacity-80 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Car className="w-5 h-5 text-purple-300" /> My Bookings
            </h2>

            {isLoading && (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 text-purple-300 animate-spin" />
              </div>
            )}
            {isError && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-red-300 text-sm">
                Failed to load bookings. Please refresh.
              </div>
            )}

            {!isLoading && !isError && bookings.length === 0 && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
                <Car className="w-12 h-12 text-purple-400 mx-auto mb-4 opacity-50" />
                <p className="text-purple-200 text-lg font-medium">No bookings yet</p>
                <button
                  onClick={() => router.push('/cars')}
                  className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm transition-colors"
                >
                  Browse Cars
                </button>
              </div>
            )}

            {bookings.map((booking: any) => {
              const statusKey: StatusKey = (booking.bookingStatus as StatusKey) in STATUS_CONFIG
                ? (booking.bookingStatus as StatusKey)
                : 'PENDING'
              const cfg = STATUS_CONFIG[statusKey]
              const isApproved = booking.bookingStatus === 'APPROVED'
              return (
                <div
                  key={booking.id}
                  className={
                    'bg-white/5 border rounded-xl p-5 transition-colors ' +
                    (isApproved ? 'border-blue-500/40 bg-blue-500/5' : 'border-white/10 hover:bg-white/[0.08]')
                  }
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <span className="text-white font-semibold text-lg">
                          {booking.car?.name || 'Car'}
                          {booking.car?.brand ? ' (' + booking.car.brand + ')' : ''}
                        </span>
                        <span className={'flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ' + cfg.color}>
                          {cfg.iconType === 'check' && <CheckCircle className="w-3.5 h-3.5" />}
                          {cfg.iconType === 'x' && <XCircle className="w-3.5 h-3.5" />}
                          {cfg.iconType === 'alert' && <AlertCircle className="w-3.5 h-3.5" />}
                          {cfg.label}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-purple-300">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-purple-400" />
                          <span>Pickup: {formatDate(booking.pickupTime)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-purple-400" />
                          <span>Drop: {formatDate(booking.dropTime)}</span>
                        </div>
                      </div>
                      <div className="mt-3 p-3 rounded-lg bg-white/5 border border-white/10 text-sm text-purple-200">
                        {cfg.message}
                      </div>
                    </div>
                    <div className="text-right shrink-0 flex flex-col items-end gap-2">
                      <div className="text-white font-bold text-xl">
                        {booking.totalPrice != null ? 'Rs.' + Number(booking.totalPrice).toLocaleString('en-IN') : 'N/A'}
                      </div>
                      <div className="text-purple-400 text-xs">
                        ID: {booking.bookingId || (booking.id || '').slice(0, 8)}
                      </div>
                      <div className={
                        'text-xs px-2 py-0.5 rounded-full ' +
                        (booking.paymentStatus === 'PAID' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300')
                      }>
                        {booking.paymentStatus === 'PAID' ? 'Paid' : 'Unpaid'}
                      </div>
                      {isApproved && booking.paymentStatus !== 'PAID' && (
                        <button
                          onClick={() => handlePayNow(booking)}
                          disabled={payingId === booking.id}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          <CreditCard className="w-4 h-4" />
                          {payingId === booking.id ? 'Processing...' : 'Pay Now'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
"""

with open(r'frontend/components/dashboard/user-dashboard.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)

# Verify
lines = content.split('\n')
print(f'Total lines: {len(lines)}')
for i, line in enumerate(lines[33:43], start=34):
    print(f'[{i}]: {line}')
