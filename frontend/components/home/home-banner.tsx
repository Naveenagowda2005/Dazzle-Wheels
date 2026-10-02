'use client'

import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Copy, Check, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import api from '@/lib/api'

interface Slide {
  type: 'car' | 'coupon' | 'blog'
  id: string
  image?: string
  title: string
  subtitle?: string
  badge?: string
  badgeColor?: string
  cta?: { label: string; href: string }
  couponCode?: string
  discount?: string
}

export function HomeBanner() {
  const [slides, setSlides] = useState<Slide[]>([])
  const [current, setCurrent] = useState(0)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function load() {
      const collected: Slide[] = []

      // --- Cars ---
      try {
        const res = await api.get('/cars/featured?limit=5')
        const cars: any[] = res.data || []
        cars.forEach((c) => {
          const img = Array.isArray(c.images) ? c.images[0] : c.images
          if (img) {
            collected.push({
              type: 'car',
              id: c.id,
              image: img,
              title: `${c.brand} ${c.name}`,
              subtitle: `₹${c.price_per_day ?? c.pricePerDay}/day · ${c.city}`,
              badge: 'Featured Car',
              badgeColor: 'bg-blue-500',
              cta: { label: 'Book Now', href: `/cars/${c.id}` },
            })
          }
        })
      } catch (_) {}

      // --- Coupons ---
      try {
        const res = await api.get('/coupons/active/public')
        const coupons: any[] = res.data || []
        coupons.slice(0, 4).forEach((c) => {
          const discount =
            c.discount_type === 'PERCENTAGE' || c.discountType === 'PERCENTAGE'
              ? `${c.discount}% OFF`
              : `FLAT ₹${c.discount} OFF`
          collected.push({
            type: 'coupon',
            id: c.id,
            image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80',
            title: discount,
            subtitle: c.min_amount ?? c.minAmount
              ? `On bookings above ₹${c.min_amount ?? c.minAmount}`
              : 'On all bookings',
            badge: 'Exclusive Offer',
            badgeColor: 'bg-green-500',
            couponCode: c.code,
            discount,
            cta: { label: 'Book & Save', href: '/cars' },
          })
        })
      } catch (_) {}

      // --- Blogs ---
      try {
        const res = await api.get('/blogs?limit=4&published=true')
        const blogs: any[] = res.data?.blogs || res.data || []
        blogs.forEach((b) => {
          if (b.featured_image || b.featuredImage) {
            collected.push({
              type: 'blog',
              id: b.id,
              image: b.featured_image || b.featuredImage,
              title: b.title,
              subtitle: b.meta_description || b.metaDescription || '',
              badge: b.category || 'Blog',
              badgeColor: 'bg-purple-500',
              cta: { label: 'Read More', href: `/blog/${b.slug}` },
            })
          }
        })
      } catch (_) {}

      if (collected.length > 0) setSlides(collected)
    }
    load()
  }, [])

  const next = useCallback(() => setCurrent((p) => (p + 1) % Math.max(1, slides.length)), [slides.length])
  const prev = useCallback(() => setCurrent((p) => (p - 1 + slides.length) % Math.max(1, slides.length)), [slides.length])

  useEffect(() => {
    if (slides.length < 2) return
    const t = setInterval(next, 4000)
    return () => clearInterval(t)
  }, [next, slides.length])

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (slides.length === 0) return null

  const slide = slides[current]

  return (
    <div className="relative w-full h-[480px] md:h-[560px] overflow-hidden bg-gray-900">
      {/* Background image */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0"
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id + '-content'}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="absolute inset-0 flex flex-col justify-center px-8 md:px-20 max-w-2xl"
        >
          {slide.badge && (
            <span className={`inline-block text-xs font-bold text-white px-3 py-1 rounded-full mb-3 w-fit ${slide.badgeColor}`}>
              {slide.badge}
            </span>
          )}

          <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-3">
            {slide.title}
          </h2>

          {slide.subtitle && (
            <p className="text-white/80 text-base md:text-lg mb-5">{slide.subtitle}</p>
          )}

          {/* Coupon code copy */}
          {slide.type === 'coupon' && slide.couponCode && (
            <div className="flex items-center gap-3 mb-5">
              <span className="bg-white/20 backdrop-blur border border-white/30 text-white font-mono font-bold text-lg px-4 py-2 rounded-lg tracking-widest">
                {slide.couponCode}
              </span>
              <button
                onClick={() => copyCode(slide.couponCode!)}
                className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-3 py-2 rounded-lg transition"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          )}

          {slide.cta && (
            <Link href={slide.cta.href}>
              <button className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-6 py-3 rounded-xl text-sm transition w-fit">
                {slide.cta.label}
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Prev / Next */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition z-10"
        aria-label="Previous"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 transition z-10"
        aria-label="Next"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all ${i === current ? 'w-6 bg-yellow-400' : 'w-2 bg-white/50 hover:bg-white/80'}`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Type indicator */}
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        {['car', 'coupon', 'blog'].map((type) => {
          const count = slides.filter((s) => s.type === type).length
          if (count === 0) return null
          const colors: Record<string, string> = { car: 'bg-blue-500', coupon: 'bg-green-500', blog: 'bg-purple-500' }
          const labels: Record<string, string> = { car: 'Cars', coupon: 'Offers', blog: 'Blogs' }
          return (
            <span key={type} className={`text-xs text-white px-2 py-0.5 rounded-full ${colors[type]} opacity-80`}>
              {labels[type]}
            </span>
          )
        })}
      </div>
    </div>
  )
}