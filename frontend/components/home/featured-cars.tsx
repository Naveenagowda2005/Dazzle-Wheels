'use client'

import { useQuery } from 'react-query'
import { Button } from '@/components/ui/button'
import { ImageSlider } from '@/components/ui/image-slider'
import { Fuel, Users, MapPin, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { ClientOnly } from '@/components/client-only'

interface Car {
  id: string
  name: string
  brand: string
  fuelType: string
  seats: number
  pricePerDay: number
  city: string
  images: string[]
}

const cardAccents = [
  'from-violet-500/20 to-purple-500/20 border-violet-500/30',
  'from-pink-500/20 to-rose-500/20 border-pink-500/30',
  'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
  'from-emerald-500/20 to-teal-500/20 border-emerald-500/30',
  'from-amber-500/20 to-orange-500/20 border-amber-500/30',
  'from-fuchsia-500/20 to-pink-500/20 border-fuchsia-500/30',
]

export function FeaturedCars() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const { data: cars, isLoading } = useQuery<Car[]>('featured-cars', async () => {
    const response = await api.get('/cars/featured?limit=6')
    return response.data
  }, { enabled: mounted })

  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-80 h-80 bg-violet-500/8 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-500/8 rounded-full blur-3xl"></div>
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-violet-500/20 text-violet-300 text-sm font-medium mb-4 border border-violet-500/30">
            <ClientOnly fallback={<div className="w-4 h-4"/>}><Sparkles className="w-4 h-4"/></ClientOnly>
            Top Picks
          </span>
          <h2 className="text-4xl font-bold text-white mb-4">Featured Cars</h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">Discover our most popular vehicles, perfect for any occasion</p>
        </div>

        {(!mounted || isLoading) ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                <div className="h-48 bg-white/10"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-white/10 rounded w-3/4"></div>
                  <div className="h-4 bg-white/10 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars?.map((car, i) => (
              <div key={car.id} className={`group rounded-2xl bg-gradient-to-br ${cardAccents[i % 6]} border backdrop-blur-sm overflow-hidden hover:scale-[1.02] transition-all duration-300 hover:shadow-2xl`}>
                <div className="relative h-48">
                  <ImageSlider images={car.images} alt={car.name} />
                </div>
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg text-white">{car.name}</h3>
                    <p className="text-sm text-slate-400">{car.brand}</p>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-400">
                    <div className="flex items-center gap-1">
                      <ClientOnly fallback={<div className="w-4 h-4"/>}><Fuel className="w-4 h-4 text-violet-400"/></ClientOnly>
                      <span>{car.fuelType}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ClientOnly fallback={<div className="w-4 h-4"/>}><Users className="w-4 h-4 text-pink-400"/></ClientOnly>
                      <span>{car.seats} Seats</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ClientOnly fallback={<div className="w-4 h-4"/>}><MapPin className="w-4 h-4 text-blue-400"/></ClientOnly>
                      <span>{car.city}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="text-2xl font-bold text-yellow-400">{formatCurrency(car.pricePerDay)}</span>
                      <span className="text-sm text-slate-400">/day</span>
                    </div>
                    <Link href={`/cars/${car.id}`}>
                      <Button size="sm" className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg shadow-purple-500/30 border-0">
                        Book Now
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link href="/cars">
            <Button variant="outline" size="lg" className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10 hover:text-white">
              View All Cars
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}