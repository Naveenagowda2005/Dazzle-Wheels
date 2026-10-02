'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Copy, Check, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface SlideItem {
  type: 'car' | 'coupon' | 'blog'
  id: string
  image: string
  title: string
  subtitle?: string
  badge?: string
  badgeColor?: string
  cta?: { label: string; href: string }
  extra?: string
  code?: string
}

export function HomeBannerSlider() {
  const [slides, setSlides] = useState<SlideItem[]>([])
  const [current, setCurrent] = useState(0)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAll() {
      const results: SlideItem[] = []

      // Fetch car images
      try {
        const res = await api.get('/cars/featured?limit=4')
        const cars: any[] = res.data || []
        cars.forEach((car) => {
          const img = Array.isArray(car.images) ? car.images[0] : car.image
          if (img) {
            results.push({
              type: 'car',
              id: car.id,
              image: img,
              title: `${car.brand} ${car.name}`,
              subtitle: `From ₹${car.pricePerDay ?? car.price_per_day}/day`,
              badge: 'Featured Car',
              badgeColor: 'bg-blue-600',
              cta: { label: 'Book Now', href: `/cars/${car.id}` },
            })
          }
        })
      } catch {}

      // Fetch active coupons
      try {
        const res = await api.get('/coupons/active/public')
        const raw: any[] = res.data || []
        raw.slice(0, 3).forEach((c) => {
          const discount = c.discount_type === 'PERCENTAGE' || c.discountType === 'PERCENTAGE'
            ? `${c.discount}% OFF`
            : `FLAT ₹${c.discount} OFF`
          results.push({
            type: 'coupon',
            id: c.id,
            image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&q=80',
            title: discount,
            subtitle: c.min_amount || c.minAmount ? `On bookings above ₹${c.min_amount ?? c.minAmount}` : 'On all bookings',
            badge: 'Exclusive Offer',
            badgeColor: 'bg-green-600',
            code: c.code,
            extra: `Valid till ${new Date(c.valid_to || c.validTo).toLocaleDateString('en-IN')}`,
            cta: { label: 'Book & Save', href: '/cars' },
          })
        })
      } catch {}

      // Fetch blogs
      try {
        const res = await api.get('/blogs?limit=3&published=true')
        const blogs: any[] = res.data?.blogs || res.data || []
        blogs.slice(0, 3).forEach((b) => {
          if (b.featured_image || b.featuredImage) {
            results.push({
              type: 'blog',
              id: b.id,
              image: b.featured_image || b.featuredImage,
              title: b.title,
              subtitle: b.meta_description || b.metaDescription || '',
              badge: b.category || 'Blog',
              badgeColor: 'bg-purple-600',
              cta: { label: 'Read More', href: `/blog/${b.slug}` },
            })
          }
        })
      } catch {}

      setSlides(results)
      setLoading(false)
    }
    fetchAll()
  }, [])

  const next = useCallback(() => setCurrent((p) => (p + 1) % Math.max(1, slides.length)), [slides.length])
  const prev = useCallback(() => setCurrent((p) => (p - 1 + Math.max(1, slides.length)) % Math.max(1, slides.length)), [slides.length])

  useEffect(() => {
    if (slides.length < 2) return
    const t = setInterval(next, 4000)
    return () => clearInterval(t)
  }, [next, slides.length])

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      toast.success(`Code ${code} copied!`)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch {
      toast.error('Failed to copy')
    }
  }

  if (loading) {
    return (
      <div className="w-full h-[420px] bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse rounded-none" />
    )
  }

  if (slides.length === 0) return null

  const slide = slides[current]

  return (
    <section className="relative w-full overflow-hidden bg-gray-900" style={{ height: '420px' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -80 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          {/* Background image */}
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />

          {/* Content */}
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-7xl mx-auto px-6 sm:px-10 w-full">
              <div className="max-w-xl space-y-4">
                {slide.badge && (
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-white ${slide.badgeColor}`}>
                    {slide.badge}
                  </span>
                )}

                <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight drop-shadow">
                  {slide.title}
                </h2>

                {slide.subtitle && (
                  <p className="text-white/80 text-base sm:text-lg">{slide.subtitle}</p>
                )}

                {/* Coupon code copy */}
                {slide.type === 'coupon' && slide.code && (
                  <div className="flex items-center gap-3">
                    <span className="bg-white/20 border border-white/40 text-white font-mono font-bold px-4 py-2 rounded-lg text-lg tracking-widest">
                      {slide.code}
                    </span>
                    <button
                      onClick={() => copyCode(slide.code!)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg flex items-center gap-1 text-sm font-medium transition"
                    >
                      {copiedCode === slide.code ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copiedCode === slide.code ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                )}

                {slide.extra && (
                  <p className="text-white/60 text-sm">{slide.extra}</p>
                )}

                {slide.cta && (
                  <Link href={slide.cta.href}>
                    <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold mt-2">
                      {slide.cta.label}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Prev / Next */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-2 z-10 transition"
        aria-label="Previous"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-2 z-10 transition"
        aria-label="Next"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((s, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all ${
              i === current
                ? 'w-6 bg-yellow-400'
                : 'w-2 bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Type indicator */}
      <div className="absolute top-4 right-4 z-10">
        <span className={`text-xs font-medium text-white px-2 py-1 rounded ${
          slide.type === 'car' ? 'bg-blue-600/80' :
          slide.type === 'coupon' ? 'bg-green-600/80' : 'bg-purple-600/80'
        }`}>
          {slide.type === 'car' ? '🚗 Car' : slide.type === 'coupon' ? '🎟 Offer' : '📝 Blog'}
        </span>
      </div>
    </section>
  )
}