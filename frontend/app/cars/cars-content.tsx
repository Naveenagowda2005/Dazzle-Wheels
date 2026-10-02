'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useQuery } from 'react-query'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { CarCard } from '@/components/cars/car-card'
import { CarFilters } from '@/components/cars/car-filters'
import { Button } from '@/components/ui/button'
import { Grid, List } from 'lucide-react'
import { ClientOnly } from '@/components/client-only'
import api from '@/lib/api'

interface Car {
  id: string; name: string; brand: string; fuelType: string
  seats: number; pricePerHour: number; pricePerDay: number
  city: string; images: string[]; description?: string
}

export function CarsPageContent() {
  const searchParams = useSearchParams()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    fuelType: '', seats: '', minPrice: '', maxPrice: '',
    pickupDate: searchParams.get('pickupDate') || '',
    dropDate: searchParams.get('dropDate') || '',
  })
  const [page, setPage] = useState(1)

  const { data, isLoading, error } = useQuery(
    ['cars', filters, page],
    async () => {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v) })
      params.set('page', page.toString())
      params.set('limit', '12')
      const hasFilters = Object.values(filters).some(v => v !== '')
      const endpoint = hasFilters ? `/cars/search?${params}` : `/cars?${params}`
      const response = await api.get(endpoint)
      return response.data
    },
    { keepPreviousData: true }
  )

  useEffect(() => {
    if (filters.city || filters.pickupDate) {
      api.post('/search-analytics', { searchCity: filters.city, pickupTime: filters.pickupDate }).catch(() => {})
    }
  }, [filters.city, filters.pickupDate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
      </div>
      <div className="relative z-10">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <span className="inline-block px-4 py-1 rounded-full bg-violet-500/20 text-violet-300 text-sm font-medium mb-3 border border-violet-500/30">Browse Fleet</span>
            <h1 className="text-3xl font-bold text-white mb-1">Available Cars</h1>
            <p className="text-slate-400">Find the perfect car for your journey</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/4">
              <CarFilters filters={filters} onFiltersChange={setFilters} />
            </div>
            <div className="lg:w-3/4">
              <div className="flex items-center justify-between mb-6">
                <div className="text-sm text-slate-400">
                  {data && `${data.pagination?.total ?? 0} cars found`}
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={() => setViewMode('grid')}
                    className={viewMode === 'grid' ? 'bg-violet-500 text-white border-0' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'}>
                    <ClientOnly fallback={<div className="w-4 h-4"/>}><Grid className="w-4 h-4"/></ClientOnly>
                  </Button>
                  <Button size="sm" onClick={() => setViewMode('list')}
                    className={viewMode === 'list' ? 'bg-violet-500 text-white border-0' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'}>
                    <ClientOnly fallback={<div className="w-4 h-4"/>}><List className="w-4 h-4"/></ClientOnly>
                  </Button>
                </div>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                      <div className="h-48 bg-white/10"></div>
                      <div className="p-4 space-y-2">
                        <div className="h-4 bg-white/10 rounded w-3/4"></div>
                        <div className="h-4 bg-white/10 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-12"><p className="text-slate-400">Failed to load cars. Please try again.</p></div>
              ) : data?.cars?.length === 0 ? (
                <div className="text-center py-12"><p className="text-slate-400">No cars found matching your criteria.</p></div>
              ) : (
                <>
                  <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                    {data?.cars?.map((car: Car) => (
                      <CarCard key={car.id} car={car} viewMode={viewMode} pickupDate={filters.pickupDate} dropDate={filters.dropDate}/>
                    ))}
                  </div>
                  {data?.pagination?.pages > 1 && (
                    <div className="flex justify-center mt-8 gap-2">
                      {[...Array(data.pagination.pages)].map((_, i) => (
                        <Button key={i} size="sm" onClick={() => setPage(i + 1)}
                          className={page === i + 1 ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'}>
                          {i + 1}
                        </Button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  )
}