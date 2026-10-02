'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MapPin, Calendar, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { ClientOnly } from '@/components/client-only'

export function SearchSection() {
  const [mounted, setMounted] = useState(false)
  const [searchData, setSearchData] = useState({ city: '', pickupDate: '', dropDate: '' })
  const router = useRouter()

  useEffect(() => { setMounted(true) }, [])

  const handleSearch = async () => {
    if (!mounted) return
    try {
      await api.post('/search-analytics', { searchCity: searchData.city, pickupTime: searchData.pickupDate })
    } catch {}
    const params = new URLSearchParams()
    if (searchData.city) params.set('city', searchData.city)
    if (searchData.pickupDate) params.set('pickupDate', searchData.pickupDate)
    if (searchData.dropDate) params.set('dropDate', searchData.dropDate)
    router.push(`/cars?${params.toString()}`)
  }

  return (
    <section className="py-20 bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/3 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1 rounded-full bg-purple-500/20 text-purple-300 text-sm font-medium mb-4 border border-purple-500/30">
            Quick Search
          </span>
          <h2 className="text-4xl font-bold text-white mb-4">Find Your Perfect Ride</h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Search and book from our premium collection of cars available across Bangalore
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* City */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-purple-300 flex items-center gap-2">
                  <ClientOnly fallback={<div className="w-4 h-4"/>}>
                    <MapPin className="w-4 h-4 text-violet-400"/>
                  </ClientOnly>
                  City
                </label>
                <Input
                  placeholder="Enter city"
                  value={searchData.city}
                  onChange={(e) => setSearchData({ ...searchData, city: e.target.value })}
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-500 focus:border-violet-500 focus:ring-violet-500/20"
                />
              </div>

              {/* Pickup */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-purple-300 flex items-center gap-2">
                  <ClientOnly fallback={<div className="w-4 h-4"/>}>
                    <Calendar className="w-4 h-4 text-pink-400"/>
                  </ClientOnly>
                  Pickup Date
                </label>
                <Input
                  type="datetime-local"
                  value={searchData.pickupDate}
                  onChange={(e) => setSearchData({ ...searchData, pickupDate: e.target.value })}
                  className="bg-white/10 border-white/20 text-white focus:border-violet-500 focus:ring-violet-500/20 [color-scheme:dark]"
                />
              </div>

              {/* Drop */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-purple-300 flex items-center gap-2">
                  <ClientOnly fallback={<div className="w-4 h-4"/>}>
                    <Calendar className="w-4 h-4 text-blue-400"/>
                  </ClientOnly>
                  Drop Date
                </label>
                <Input
                  type="datetime-local"
                  value={searchData.dropDate}
                  onChange={(e) => setSearchData({ ...searchData, dropDate: e.target.value })}
                  className="bg-white/10 border-white/20 text-white focus:border-violet-500 focus:ring-violet-500/20 [color-scheme:dark]"
                />
              </div>

              {/* Button */}
              <div className="flex items-end">
                <Button
                  onClick={handleSearch}
                  className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold shadow-lg shadow-purple-500/30 border-0 h-10"
                >
                  <ClientOnly fallback={<div className="w-4 h-4 mr-2"/>}>
                    <Search className="w-4 h-4 mr-2"/>
                  </ClientOnly>
                  Search Cars
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}