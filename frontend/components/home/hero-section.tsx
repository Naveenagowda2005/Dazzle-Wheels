'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, BookOpen, ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ClientOnly } from '@/components/client-only'
import { useState, useEffect, useCallback } from 'react'
import { useQuery } from 'react-query'
import api from '@/lib/api'

interface Blog {
  id: string
  title: string
  slug: string
  content: string
  featured_image?: string
  meta_description?: string
  category?: string
  created_at: string
}

const fallbackBlogs: Blog[] = [
  {
    id: '1', title: 'Top 5 Road Trips from Bangalore', slug: 'top-5-road-trips-from-bangalore',
    content: '', meta_description: 'Discover the most scenic road trip routes from Bangalore.',
    category: 'Travel', created_at: new Date().toISOString(),
    featured_image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80',
  },
  {
    id: '2', title: 'How to Choose the Right Car for Your Trip', slug: 'how-to-choose-right-car-for-trip',
    content: '', meta_description: 'A complete guide to picking the perfect rental car.',
    category: 'Tips', created_at: new Date().toISOString(),
    featured_image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80',
  },
  {
    id: '3', title: 'Weekend Getaway: Coorg by Car', slug: 'weekend-getaway-coorg-rental-car',
    content: '', meta_description: 'Plan the perfect weekend escape to Coorg.',
    category: 'Travel', created_at: new Date().toISOString(),
    featured_image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  },
  {
    id: '4', title: '5 Tips to Save Money on Car Rentals', slug: '5-tips-save-money-car-rentals',
    content: '', meta_description: 'Smart strategies to get the best deals on car rentals.',
    category: 'Tips', created_at: new Date().toISOString(),
    featured_image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80',
  },
  {
    id: '5', title: 'Electric Cars Are the Future of Car Rentals', slug: 'electric-cars-future-of-car-rentals',
    content: '', meta_description: 'How electric vehicles are transforming car rentals in India.',
    category: 'Technology', created_at: new Date().toISOString(),
    featured_image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&q=80',
  },
]

function BlogCarousel({ blogs }: { blogs: Blog[] }) {
  const items = blogs.length > 0 ? blogs : fallbackBlogs
  const [current, setCurrent] = useState(0)

  const next = useCallback(() => setCurrent((p) => (p + 1) % items.length), [items.length])
  const prev = useCallback(() => setCurrent((p) => (p - 1 + items.length) % items.length), [items.length])

  useEffect(() => {
    const t = setInterval(next, 4000)
    return () => clearInterval(t)
  }, [next])

  const blog = items[current]
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <div className="relative w-full">
      <Link href={`/blog/${blog.slug}`} className="block group">
        <div className="relative overflow-hidden rounded-2xl shadow-2xl shadow-purple-900/50 aspect-[4/3] ring-1 ring-white/10 cursor-pointer">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              {blog.featured_image ? (
                <img
                  src={blog.featured_image}
                  alt={blog.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-violet-600/40 to-purple-800/40 flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-violet-300/50" />
                </div>
              )}
              {/* Dark gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              {/* Text overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-5">
                {blog.category && (
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-violet-500/80 text-violet-100 text-xs font-medium mb-2 backdrop-blur-sm">
                    {blog.category}
                  </span>
                )}
                <h3 className="text-white font-bold text-lg leading-snug mb-1 line-clamp-2 group-hover:text-violet-200 transition-colors">
                  {blog.title}
                </h3>
                <p className="text-slate-300 text-sm line-clamp-2 mb-2">{blog.meta_description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-slate-400 text-xs">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(blog.created_at)}</span>
                  </div>
                  <span className="text-violet-300 text-xs font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                    Read More <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <button
            onClick={(e) => { e.preventDefault(); prev() }}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-purple-600/70 text-white rounded-full p-1.5 transition backdrop-blur-sm z-10"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); next() }}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-purple-600/70 text-white rounded-full p-1.5 transition backdrop-blur-sm z-10"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </Link>

      <div className="flex justify-center gap-2 mt-4">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${i === current ? 'bg-violet-400 scale-125' : 'bg-white/30 hover:bg-white/50'}`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      <div className="absolute -top-4 -right-4 w-24 h-24 bg-violet-500 rounded-full opacity-20 animate-pulse pointer-events-none" />
      <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-pink-500 rounded-full opacity-20 animate-pulse delay-1000 pointer-events-none" />
    </div>
  )
}

export function HeroSection() {
  const { data } = useQuery(
    ['hero-blogs'],
    async () => {
      const res = await api.get('/blogs?page=1&limit=5&published=true')
      return res.data
    },
    { staleTime: 5 * 60 * 1000 }
  )

  const blogs: Blog[] = data?.blogs || []

  const leftContent = (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="inline-block px-4 py-1 rounded-full bg-violet-500/20 text-violet-300 text-sm font-medium border border-violet-500/30">
          #1 Car Rental in Bangalore
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-white">
          Drive Your
          <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            Dreams Today
          </span>
        </h1>
        <p className="text-xl text-slate-300 max-w-lg">
          Experience premium car rentals in Bangalore with Dazzle Wheels.
          Choose from our fleet of well-maintained vehicles for your perfect journey.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/cars">
          <Button size="lg" className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-black font-bold shadow-lg shadow-yellow-500/30">
            Book Now
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </Link>
        <Link href="/blog">
          <Button variant="outline" size="lg" className="border-violet-400 text-violet-300 hover:bg-violet-500/20 hover:text-white backdrop-blur-sm">
            <BookOpen className="mr-2 w-5 h-5" />
            Read Blog
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-8 pt-8 border-t border-white/10">
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-400">500+</div>
          <div className="text-sm text-slate-400">Happy Customers</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-400">50+</div>
          <div className="text-sm text-slate-400">Premium Cars</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-400">24/7</div>
          <div className="text-sm text-slate-400">Support</div>
        </div>
      </div>
    </div>
  )

  return (
    <section className="relative bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <ClientOnly fallback={leftContent}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              {leftContent}
            </motion.div>
          </ClientOnly>

          <ClientOnly fallback={
            <div className="relative overflow-hidden rounded-2xl shadow-2xl aspect-[4/3] bg-gradient-to-br from-violet-600/20 to-purple-800/20" />
          }>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <BlogCarousel blogs={blogs} />
            </motion.div>
          </ClientOnly>
        </div>
      </div>

      {/* Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" className="w-full h-auto">
          <path fill="rgb(15 23 42)" d="M0,40L48,45C96,50,192,60,288,58C384,56,480,44,576,40C672,36,768,40,864,46C960,52,1056,58,1152,56C1248,54,1344,44,1392,38L1440,32L1440,80L0,80Z" />
        </svg>
      </div>
    </section>
  )
}