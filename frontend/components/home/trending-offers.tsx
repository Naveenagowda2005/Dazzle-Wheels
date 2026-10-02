'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Copy, Check, Tag } from 'lucide-react'
import { ClientOnly } from '@/components/client-only'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface Coupon {
  id: string
  code: string
  discount: number
  discountType: string
  minAmount?: number
  validTo: string
  usedCount: number
  active: boolean
}

const CARDS_VISIBLE = 2
const AUTO_SLIDE_MS = 3000

const cardGradients = [
  'from-violet-600 to-purple-700',
  'from-pink-600 to-rose-700',
  'from-blue-600 to-cyan-700',
  'from-emerald-600 to-teal-700',
  'from-amber-600 to-orange-700',
  'from-fuchsia-600 to-pink-700',
]

export function TrendingOffers() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => { fetchActiveCoupons() }, [])

  const fetchActiveCoupons = async () => {
    try {
      const response = await api.get('/coupons/active/public')
      const raw: any[] = response.data || []
      setCoupons(raw.map((c) => ({
        id: c.id, code: c.code, discount: c.discount,
        discountType: c.discount_type || c.discountType,
        minAmount: c.min_amount ?? c.minAmount,
        validTo: c.valid_to || c.validTo,
        usedCount: c.used_count ?? c.usedCount ?? 0,
        active: c.active,
      })))
    } catch { /* silent */ } finally { setLoading(false) }
  }

  const isValid = (c: Coupon) => new Date(c.validTo) > new Date() && c.active
  const validCoupons = coupons.filter(isValid)
  const maxIndex = Math.max(0, validCoupons.length - CARDS_VISIBLE)

  const next = useCallback(() => setCurrentIndex((p) => (p >= maxIndex ? 0 : p + 1)), [maxIndex])
  const prev = useCallback(() => setCurrentIndex((p) => (p <= 0 ? maxIndex : p - 1)), [maxIndex])

  useEffect(() => {
    if (validCoupons.length <= CARDS_VISIBLE) return
    const t = setInterval(next, AUTO_SLIDE_MS)
    return () => clearInterval(t)
  }, [next, validCoupons.length])

  const copy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      toast.success(`${code} copied!`)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch { toast.error('Failed to copy') }
  }

  const formatDiscount = (c: Coupon) =>
    c.discountType === 'PERCENTAGE' ? `${c.discount}% OFF` : `FLAT ₹${c.discount} OFF`

  const getDesc = (c: Coupon) =>
    c.discountType === 'PERCENTAGE'
      ? `Get ${c.discount}% off${c.minAmount ? ` on bookings above ₹${c.minAmount}` : ''}`
      : `Flat ₹${c.discount} off${c.minAmount ? ` on bookings above ₹${c.minAmount}` : ''}`

  if (loading) return (
    <section className="py-20 bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl font-bold text-white mb-10">Trending Offers</h2>
        <div className="flex justify-center gap-6">
          {[1,2].map(i => <div key={i} className="animate-pulse bg-white/10 h-44 w-80 rounded-2xl"/>)}
        </div>
      </div>
    </section>
  )

  if (validCoupons.length === 0) return null

  const visible = validCoupons.slice(currentIndex, currentIndex + CARDS_VISIBLE)

  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500/8 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-500/8 rounded-full blur-3xl"></div>
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-pink-500/20 text-pink-300 text-sm font-medium mb-4 border border-pink-500/30">
            <ClientOnly fallback={<div className="w-4 h-4"/>}><Tag className="w-4 h-4"/></ClientOnly>
            Exclusive Deals
          </span>
          <h2 className="text-4xl font-bold text-white mb-4">Trending Offers</h2>
          <p className="text-slate-400">Use these exclusive codes on your next booking</p>
        </div>

        <div className="flex items-center justify-center gap-4">
          {validCoupons.length > CARDS_VISIBLE && (
            <button onClick={prev} className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 transition" aria-label="Previous">
              <ClientOnly fallback={<div className="w-5 h-5"/>}><ChevronLeft className="w-5 h-5"/></ClientOnly>
            </button>
          )}

          <div className="flex gap-6 overflow-hidden">
            <AnimatePresence mode="wait">
              {visible.map((coupon, i) => (
                <motion.div
                  key={`${coupon.id}-${currentIndex}`}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.4 }}
                  className={`w-80 rounded-2xl bg-gradient-to-br ${cardGradients[(currentIndex + i) % cardGradients.length]} p-6 shadow-2xl`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-bold backdrop-blur-sm">{coupon.code}</span>
                    <span className="bg-yellow-400 text-black px-3 py-1 rounded-lg text-sm font-bold">{formatDiscount(coupon)}</span>
                  </div>
                  <p className="text-white/90 text-sm mb-5">{getDesc(coupon)}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/70">Valid till {new Date(coupon.validTo).toLocaleDateString()}</span>
                    <Button size="sm" onClick={() => copy(coupon.code)} className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm">
                      <ClientOnly fallback={<div className="w-4 h-4 mr-1"/>}>
                        {copiedCode === coupon.code ? <Check className="w-4 h-4 mr-1"/> : <Copy className="w-4 h-4 mr-1"/>}
                      </ClientOnly>
                      {copiedCode === coupon.code ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {validCoupons.length > CARDS_VISIBLE && (
            <button onClick={next} className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 transition" aria-label="Next">
              <ClientOnly fallback={<div className="w-5 h-5"/>}><ChevronRight className="w-5 h-5"/></ClientOnly>
            </button>
          )}
        </div>

        {validCoupons.length > CARDS_VISIBLE && (
          <div className="flex justify-center mt-6 gap-2">
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button key={i} onClick={() => setCurrentIndex(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${i === currentIndex ? 'bg-purple-400 scale-125' : 'bg-white/20 hover:bg-white/40'}`}
              />
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Button className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg shadow-purple-500/30 px-8" onClick={() => router.push('/cars')}>
            Book Now & Save
          </Button>
        </div>
      </div>
    </section>
  )
}