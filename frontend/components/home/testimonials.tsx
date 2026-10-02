'use client'

import { Star } from 'lucide-react'
import { ClientOnly } from '@/components/client-only'
import { useQuery } from 'react-query'
import api from '@/lib/api'

interface Testimonial {
  id: string
  name: string
  location: string
  rating: number
  comment: string
  avatar_url: string
}

const cardGradients = [
  'from-violet-600/20 to-purple-600/20 border-violet-500/30',
  'from-pink-600/20 to-rose-600/20 border-pink-500/30',
  'from-blue-600/20 to-cyan-600/20 border-blue-500/30',
]

export function Testimonials() {
  const { data: testimonials, isLoading, error } = useQuery('testimonials', async () => {
    try {
      const response = await api.get('/testimonials/featured?limit=3')
      return response.data || []
    } catch {
      return []
    }
  }, { retry: 2, refetchOnWindowFocus: false, staleTime: 10 * 60 * 1000 })

  if (isLoading) {
    return (
      <section className="py-20 bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-white mb-4">What Our Customers Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl bg-white/5 border border-white/10 p-6 h-48"></div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error || !testimonials || testimonials.length === 0) return null

  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/3 w-80 h-80 bg-violet-500/8 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-pink-500/8 rounded-full blur-3xl"></div>
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1 rounded-full bg-violet-500/20 text-violet-300 text-sm font-medium mb-4 border border-violet-500/30">Reviews</span>
          <h2 className="text-4xl font-bold text-white mb-4">What Our Customers Say</h2>
          <p className="text-lg text-violet-200 max-w-2xl mx-auto">Hear from our happy customers across Bangalore</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t: Testimonial, i: number) => (
            <div key={t.id} className={`p-6 rounded-2xl bg-gradient-to-br ${cardGradients[i % 3]} border backdrop-blur-sm hover:scale-105 transition-transform duration-300`}>
              <div className="flex items-center mb-4">
                <ClientOnly fallback={<div className="flex space-x-1">{[...Array(5)].map((_,j)=><div key={j} className="w-4 h-4 bg-yellow-400 rounded"/>)}</div>}>
                  <div className="flex space-x-1">
                    {[...Array(t.rating)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </ClientOnly>
              </div>
              <p className="text-slate-300 mb-6 italic text-sm leading-relaxed">"{t.comment}"</p>
              <div className="flex items-center">
                <img
                  src={t.avatar_url}
                  alt={t.name}
                  className="w-11 h-11 rounded-full mr-3 ring-2 ring-white/20"
                  onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=7c3aed&color=fff` }}
                />
                <div>
                  <h4 className="font-semibold text-white text-sm">{t.name}</h4>
                  <p className="text-xs text-slate-400">{t.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}