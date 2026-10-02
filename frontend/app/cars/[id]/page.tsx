'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ImageSlider } from '@/components/ui/image-slider'
import { Fuel, Users, MapPin, Calendar, Clock, ArrowLeft, Tag, Upload, X, FileImage } from 'lucide-react'
import { ClientOnly } from '@/components/client-only'
import { useAuth } from '@/contexts/auth-context'
import api from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Car {
  id: string
  name: string
  brand: string
  fuelType: string
  fuel_type?: string
  seats: number
  pricePerHour: number
  price_per_hour?: number
  pricePerDay: number
  price_per_day?: number
  city: string
  description?: string
  images: string[]
  availability: boolean
}

export default function CarDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated } = useAuth()

  const [car, setCar] = useState<Car | null>(null)
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponValidating, setCouponValidating] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null)

  // License image upload
  const [licenseFile, setLicenseFile] = useState<File | null>(null)
  const [licensePreview, setLicensePreview] = useState<string | null>(null)

  const [form, setForm] = useState({
    pickupTime: searchParams.get('pickup') || '',
    dropTime: searchParams.get('drop') || '',
    idProof: '',
  })

  useEffect(() => {
    fetchCar()
  }, [params.id])

  const fetchCar = async () => {
    try {
      const response = await api.get(`/cars/${params.id}`)
      const c = response.data
      setCar({
        ...c,
        fuelType: c.fuelType || c.fuel_type,
        pricePerHour: c.pricePerHour ?? c.price_per_hour ?? 0,
        pricePerDay: c.pricePerDay ?? c.price_per_day ?? 0,
        images: c.images || [],
      })
    } catch {
      toast.error('Car not found')
      router.push('/cars')
    } finally {
      setLoading(false)
    }
  }

  const handleLicenseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB')
      return
    }
    setLicenseFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setLicensePreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const removeLicense = () => {
    setLicenseFile(null)
    setLicensePreview(null)
  }

  const calcTotalPrice = () => {
    if (!car || !form.pickupTime || !form.dropTime) return 0
    const pickup = new Date(form.pickupTime)
    const drop = new Date(form.dropTime)
    const hours = Math.max(1, Math.ceil((drop.getTime() - pickup.getTime()) / (1000 * 60 * 60)))
    const days = Math.floor(hours / 24)
    const remainingHours = hours % 24
    return days * car.pricePerDay + remainingHours * car.pricePerHour
  }

  const totalPrice = calcTotalPrice()
  const finalPrice = Math.max(0, totalPrice - couponDiscount)

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    setCouponValidating(true)
    try {
      const response = await api.post('/coupons/validate', { code: couponCode.trim().toUpperCase(), amount: totalPrice })
      setAppliedCoupon(couponCode.trim().toUpperCase())
      setCouponDiscount(response.data.discount)
      toast.success(`Coupon applied! You save ${formatCurrency(response.data.discount)}`)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid coupon code')
      setAppliedCoupon(null)
      setCouponDiscount(0)
    } finally {
      setCouponValidating(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponDiscount(0)
    setCouponCode('')
  }

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isAuthenticated) {
      toast.error('Please login to book a car')
      router.push(`/login?redirect=/cars/${params.id}`)
      return
    }

    if (!form.pickupTime || !form.dropTime) {
      toast.error('Please select pickup and drop times')
      return
    }

    if (new Date(form.dropTime) <= new Date(form.pickupTime)) {
      toast.error('Drop time must be after pickup time')
      return
    }

    if (!licenseFile) {
      toast.error('Please upload your driving license image')
      return
    }

    setBooking(true)
    try {
      // Send as multipart/form-data so the backend FilesInterceptor can handle the image
      const formData = new FormData()
      formData.append('carId', params.id as string)
      formData.append('pickupTime', new Date(form.pickupTime).toISOString())
      formData.append('dropTime', new Date(form.dropTime).toISOString())
      formData.append('documents', licenseFile, licenseFile.name)
      if (form.idProof) formData.append('idProof', form.idProof)
      if (appliedCoupon) formData.append('couponCode', appliedCoupon)

      const sessionData = localStorage.getItem('dazzle_session')
      const token = sessionData ? JSON.parse(sessionData).access_token : ''

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
      const response = await fetch(`${apiUrl}/bookings`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      if (!response.ok) {
        let errMsg = 'Booking failed'
        try {
          const err = await response.json()
          errMsg = err.message || errMsg
        } catch {}
        throw new Error(errMsg)
      }

      toast.success('Booking submitted! Awaiting admin verification.')
      router.push('/dashboard')
    } catch (err: any) {
      toast.error(err.message || 'Booking failed. Please try again.')
    } finally {
      setBooking(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-80 bg-gray-200 rounded-xl" />
            <div className="h-8 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!car) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/cars" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
          <ClientOnly fallback={<div className="w-4 h-4 mr-1" />}>
            <ArrowLeft className="w-4 h-4 mr-1" />
          </ClientOnly>
          Back to Cars
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Car Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="h-80 rounded-xl overflow-hidden">
              <ImageSlider images={car.images} alt={car.name} />
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{car.name}</h1>
                    <p className="text-lg text-gray-600">{car.brand}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    car.availability ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {car.availability ? 'Available' : 'Unavailable'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <ClientOnly fallback={<div className="w-5 h-5" />}>
                      <Fuel className="w-5 h-5 text-blue-500" />
                    </ClientOnly>
                    <span>{car.fuelType}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <ClientOnly fallback={<div className="w-5 h-5" />}>
                      <Users className="w-5 h-5 text-blue-500" />
                    </ClientOnly>
                    <span>{car.seats} Seats</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <ClientOnly fallback={<div className="w-5 h-5" />}>
                      <MapPin className="w-5 h-5 text-blue-500" />
                    </ClientOnly>
                    <span>{car.city}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-6 mb-4">
                  <div>
                    <span className="text-3xl font-bold text-blue-600">{formatCurrency(car.pricePerDay)}</span>
                    <span className="text-gray-500">/day</span>
                  </div>
                  <div>
                    <span className="text-xl font-semibold text-gray-700">{formatCurrency(car.pricePerHour)}</span>
                    <span className="text-gray-500">/hr</span>
                  </div>
                </div>

                {car.description && (
                  <p className="text-gray-600 leading-relaxed">{car.description}</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Booking Form */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Book This Car</CardTitle>
              </CardHeader>
              <CardContent>
                {!car.availability ? (
                  <div className="text-center py-6">
                    <p className="text-red-600 font-medium">This car is currently unavailable.</p>
                    <Link href="/cars">
                      <Button className="mt-4" variant="outline">Browse Other Cars</Button>
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={handleBooking} className="space-y-4">
                    {/* Pickup */}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        <ClientOnly fallback={<span>Pickup Date & Time *</span>}>
                          <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Pickup Date & Time *</span>
                        </ClientOnly>
                      </label>
                      <Input
                        type="datetime-local"
                        value={form.pickupTime}
                        min={new Date().toISOString().slice(0, 16)}
                        onChange={(e) => setForm({ ...form, pickupTime: e.target.value })}
                        required
                      />
                    </div>

                    {/* Drop */}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        <ClientOnly fallback={<span>Drop Date & Time *</span>}>
                          <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Drop Date & Time *</span>
                        </ClientOnly>
                      </label>
                      <Input
                        type="datetime-local"
                        value={form.dropTime}
                        min={form.pickupTime || new Date().toISOString().slice(0, 16)}
                        onChange={(e) => setForm({ ...form, dropTime: e.target.value })}
                        required
                      />
                    </div>

                    {/* Driving License Image - REQUIRED */}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        <ClientOnly fallback={<span>Driving License Image *</span>}>
                          <span className="flex items-center gap-1"><FileImage className="w-4 h-4 text-blue-500" /> Driving License Image *</span>
                        </ClientOnly>
                      </label>
                      <p className="text-xs text-gray-500 mb-2">Required for admin verification before confirmation</p>

                      {licensePreview ? (
                        <div className="relative">
                          <img
                            src={licensePreview}
                            alt="Driving License"
                            className="w-full h-36 object-cover rounded-lg border-2 border-blue-200"
                          />
                          <button
                            type="button"
                            onClick={removeLicense}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                          >
                            <ClientOnly fallback={<span>×</span>}>
                              <X className="w-3 h-3" />
                            </ClientOnly>
                          </button>
                          <p className="text-xs text-green-600 mt-1 font-medium">✓ License uploaded</p>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-blue-50 hover:border-blue-300 transition-colors">
                          <ClientOnly fallback={<div className="w-8 h-8 mb-2" />}>
                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                          </ClientOnly>
                          <span className="text-sm text-gray-500">Click to upload license photo</span>
                          <span className="text-xs text-gray-400">JPG, PNG up to 5MB</span>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleLicenseChange}
                          />
                        </label>
                      )}
                    </div>

                    {/* ID Proof */}
                    <div>
                      <label className="block text-sm font-medium mb-1">ID Proof No. (optional)</label>
                      <Input
                        placeholder="Aadhar / Passport No."
                        value={form.idProof}
                        onChange={(e) => setForm({ ...form, idProof: e.target.value })}
                      />
                    </div>

                    {/* Coupon */}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        <ClientOnly fallback={<span>Coupon Code</span>}>
                          <span className="flex items-center gap-1"><Tag className="w-4 h-4" /> Coupon Code</span>
                        </ClientOnly>
                      </label>
                      {appliedCoupon ? (
                        <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-md px-3 py-2">
                          <span className="text-green-700 font-medium text-sm">{appliedCoupon} applied!</span>
                          <button type="button" onClick={handleRemoveCoupon} className="text-red-500 text-xs hover:underline">Remove</button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Input
                            placeholder="Enter coupon code"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          />
                          <Button type="button" variant="outline" size="sm" onClick={handleApplyCoupon} disabled={couponValidating || !couponCode.trim()}>
                            {couponValidating ? '...' : 'Apply'}
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Price Summary */}
                    {totalPrice > 0 && (
                      <div className="bg-blue-50 rounded-lg p-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subtotal</span>
                          <span className="font-medium">{formatCurrency(totalPrice)}</span>
                        </div>
                        {couponDiscount > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Coupon Discount</span>
                            <span>- {formatCurrency(couponDiscount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-base border-t pt-2">
                          <span>Total</span>
                          <span className="text-blue-600">{formatCurrency(finalPrice)}</span>
                        </div>
                      </div>
                    )}

                    {!isAuthenticated && (
                      <p className="text-sm text-amber-600 bg-amber-50 rounded p-2">
                        Please <Link href="/login" className="underline font-medium">login</Link> to complete your booking.
                      </p>
                    )}

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
                      Your booking will be in <strong>PENDING</strong> status until admin verifies your driving license and confirms it.
                    </div>

                    <Button type="submit" className="w-full" disabled={booking || !licenseFile}>
                      {booking ? 'Submitting...' : 'Submit Booking'}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
