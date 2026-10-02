'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Eye, CheckCircle, XCircle, Clock, X, Trash2 } from 'lucide-react'
import api from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Booking {
  id: string
  bookingId: string
  user?: { id: string; name: string; email: string; phone?: string }
  car?: { id: string; name: string; brand: string }
  pickupTime: string
  dropTime: string
  totalPrice: number
  paymentStatus: string
  bookingStatus: string
  createdAt: string
  drivingLicense?: string
  driving_license?: string
  idProof?: string
  id_proof?: string
  pickupLocation?: string
  dropLocation?: string
}

const STATUS_CONFIG = {
  PENDING:   { variant: 'secondary' as const,    label: 'Pending',  color: 'bg-yellow-100 text-yellow-800' },
  APPROVED:  { variant: 'default' as const,      label: 'Approved', color: 'bg-blue-100 text-blue-800' },
  REJECTED:  { variant: 'destructive' as const,  label: 'Rejected', color: 'bg-red-100 text-red-800' },
  CONFIRMED: { variant: 'default' as const,      label: 'Confirmed',color: 'bg-green-100 text-green-800' },
  CANCELLED: { variant: 'destructive' as const,  label: 'Cancelled',color: 'bg-red-100 text-red-800' },
  COMPLETED: { variant: 'outline' as const,      label: 'Completed',color: 'bg-gray-100 text-gray-800' },
}

const PAYMENT_CONFIG = {
  UNPAID:    { variant: 'secondary' as const,  label: 'Unpaid' },
  PENDING:   { variant: 'secondary' as const,  label: 'Unpaid' },
  PAID:      { variant: 'default' as const,    label: 'Paid' },
  COMPLETED: { variant: 'default' as const,    label: 'Paid' },
  FAILED:    { variant: 'destructive' as const,label: 'Failed' },
  REFUNDED:  { variant: 'outline' as const,    label: 'Refunded' },
}

export function BookingsManagement() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewBooking, setViewBooking] = useState<Booking | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery(['admin-bookings', page], async () => {
    const params = new URLSearchParams({ page: page.toString(), limit: '100' })
    const response = await api.get(`/bookings?${params.toString()}`)
    return response.data
  }, {
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
    staleTime: 0,
  })

  const allBookings: Booking[] = data?.bookings || []
  const filteredBookings = statusFilter === 'all'
    ? allBookings
    : allBookings.filter((b) => b.bookingStatus === statusFilter)

  const updateStatusMutation = useMutation(
    ({ id, action }: { id: string; action: 'approve' | 'reject' | string }) => {
      if (action === 'approve') return api.patch(`/bookings/${id}/approve`, {})
      if (action === 'reject') return api.patch(`/bookings/${id}/reject`, {})
      return api.patch(`/bookings/${id}`, { bookingStatus: action })
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-bookings'])
        toast.success('Booking updated')
      },
      onError: (err: any) => {
        const msg = err?.response?.data?.message || err?.message || 'Failed to update booking'
        toast.error(msg)
      },
    }
  )

  const deleteMutation = useMutation(
    (id: string) => api.delete(`/bookings/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-bookings'])
        toast.success('Booking deleted')
      },
      onError: () => { toast.error('Failed to delete booking') },
    }
  )

  const handleDelete = (booking: Booking) => {
    if (confirm(`Delete booking #${booking.bookingId}? This cannot be undone.`)) {
      deleteMutation.mutate(booking.id)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Bookings Management</h1>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 h-20 rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Bookings Management</h1>
        <select
          className="px-3 py-2 border rounded-md"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Bookings ({filteredBookings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredBookings.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No bookings found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking: Booking) => (
                <div key={booking.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h3 className="font-semibold text-lg">#{booking.bookingId}</h3>
                        <Badge variant={STATUS_CONFIG[booking.bookingStatus as keyof typeof STATUS_CONFIG]?.variant || 'secondary'}>
                          {STATUS_CONFIG[booking.bookingStatus as keyof typeof STATUS_CONFIG]?.label || booking.bookingStatus}
                        </Badge>
                        <Badge variant={PAYMENT_CONFIG[booking.paymentStatus as keyof typeof PAYMENT_CONFIG]?.variant || 'secondary'}>
                          {PAYMENT_CONFIG[booking.paymentStatus as keyof typeof PAYMENT_CONFIG]?.label || booking.paymentStatus}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Customer</p>
                          <p className="font-medium">{booking.user?.name || 'N/A'}</p>
                          <p className="text-gray-500">{booking.user?.email || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Car</p>
                          <p className="font-medium">{booking.car?.name || 'N/A'}</p>
                          <p className="text-gray-500">{booking.car?.brand || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Duration</p>
                          <p className="font-medium">{formatDate(booking.pickupTime)}</p>
                          <p className="text-gray-500">to {formatDate(booking.dropTime)}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="text-lg font-bold text-blue-600">{formatCurrency(booking.totalPrice)}</div>
                        <div className="text-sm text-gray-500">Booked on {formatDate(booking.createdAt)}</div>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      <Button size="sm" variant="outline" onClick={() => setViewBooking(booking)}>
                        <Eye className="w-4 h-4 mr-1" /> View
                      </Button>

                      {booking.bookingStatus === 'PENDING' && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => updateStatusMutation.mutate({ id: booking.id, action: 'approve' })}
                            disabled={updateStatusMutation.isLoading}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateStatusMutation.mutate({ id: booking.id, action: 'reject' })}
                            disabled={updateStatusMutation.isLoading}
                          >
                            <XCircle className="w-4 h-4 mr-1" /> Reject
                          </Button>
                        </>
                      )}

                      {booking.bookingStatus === 'CONFIRMED' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatusMutation.mutate({ id: booking.id, action: 'COMPLETED' })}
                          disabled={updateStatusMutation.isLoading}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" /> Complete
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(booking)}
                        disabled={deleteMutation.isLoading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Booking Modal */}
      {viewBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Booking #{viewBooking.bookingId}
                <Button variant="outline" size="sm" onClick={() => setViewBooking(null)}><X className="w-4 h-4" /></Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Booking Status</p>
                  <Badge variant={STATUS_CONFIG[viewBooking.bookingStatus as keyof typeof STATUS_CONFIG]?.variant || 'secondary'}>
                    {STATUS_CONFIG[viewBooking.bookingStatus as keyof typeof STATUS_CONFIG]?.label || viewBooking.bookingStatus}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Status</p>
                  <Badge variant={PAYMENT_CONFIG[viewBooking.paymentStatus as keyof typeof PAYMENT_CONFIG]?.variant || 'secondary'}>
                    {PAYMENT_CONFIG[viewBooking.paymentStatus as keyof typeof PAYMENT_CONFIG]?.label || viewBooking.paymentStatus}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">Customer</p>
                <p className="font-medium">{viewBooking.user?.name || 'N/A'}</p>
                <p className="text-sm text-gray-600">{viewBooking.user?.email || 'N/A'}</p>
                {viewBooking.user?.phone && <p className="text-sm text-gray-600">{viewBooking.user.phone}</p>}
              </div>

              <div>
                <p className="text-sm text-gray-500 font-medium mb-1">Car</p>
                <p className="font-medium">{viewBooking.car?.name || 'N/A'}</p>
                <p className="text-sm text-gray-600">{viewBooking.car?.brand || 'N/A'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Pickup</p>
                  <p className="font-medium">{formatDate(viewBooking.pickupTime)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Drop</p>
                  <p className="font-medium">{formatDate(viewBooking.dropTime)}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(viewBooking.totalPrice)}</p>
              </div>

              {/* Driving License Image */}
              {(viewBooking.drivingLicense || viewBooking.driving_license) && (
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-2">Driving License</p>
                  <a
                    href={viewBooking.drivingLicense || viewBooking.driving_license}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={viewBooking.drivingLicense || viewBooking.driving_license}
                      alt="Driving License"
                      className="w-full rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-colors cursor-pointer"
                    />
                  </a>
                  <p className="text-xs text-gray-400 mt-1">Click image to open full size</p>
                </div>
              )}

              {!(viewBooking.drivingLicense || viewBooking.driving_license) && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800 font-medium">No driving license uploaded</p>
                </div>
              )}

              {/* Admin Actions */}
              {viewBooking.bookingStatus === 'PENDING' && (
                <div className="border-t pt-4 space-y-2">
                  <p className="text-sm font-medium text-gray-700">Admin Actions — Review License & Approve</p>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => { updateStatusMutation.mutate({ id: viewBooking.id, action: 'approve' }); setViewBooking(null) }}
                      disabled={updateStatusMutation.isLoading}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" /> Approve
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => { updateStatusMutation.mutate({ id: viewBooking.id, action: 'reject' }); setViewBooking(null) }}
                      disabled={updateStatusMutation.isLoading}
                    >
                      <XCircle className="w-4 h-4 mr-1" /> Reject
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button variant="outline" onClick={() => setViewBooking(null)}>Close</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
