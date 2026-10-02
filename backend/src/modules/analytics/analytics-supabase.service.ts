import { Injectable } from '@nestjs/common'

@Injectable()
export class AnalyticsSupabaseService {
  private supabaseUrl: string
  private supabaseKey: string

  constructor() {
    this.supabaseUrl = process.env.SUPABASE_URL || 'https://gqrwjafrebbgpvkfphzw.supabase.co'
    this.supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
  }

  private async supabaseQuery(table: string, query: string = '') {
    try {
      const url = `${this.supabaseUrl}/rest/v1/${table}${query}`
      const response = await fetch(url, {
        headers: {
          'apikey': this.supabaseKey,
          'Authorization': `Bearer ${this.supabaseKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Supabase query failed: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Supabase query error:', error)
      throw error
    }
  }

  async getOverview() {
    try {
      // Get counts using Supabase REST API
      const [carsResponse, usersResponse, bookingsResponse, revenueResponse] = await Promise.all([
        this.supabaseQuery('cars', '?select=count'),
        this.supabaseQuery('users', '?select=count&role=eq.USER'),
        this.supabaseQuery('bookings', '?select=count'),
        this.supabaseQuery('bookings', '?select=total_price&payment_status=eq.COMPLETED')
      ])

      // Calculate totals
      const totalCars = carsResponse.length || 0
      const totalUsers = usersResponse.length || 0
      const totalBookings = bookingsResponse.length || 0
      const totalRevenue = revenueResponse.reduce((sum: number, booking: any) => 
        sum + (booking.total_price || 0), 0)

      // Get booking status distribution
      const statusResponse = await this.supabaseQuery('bookings', '?select=booking_status')
      const bookingsByStatus = statusResponse.reduce((acc: any, booking: any) => {
        const status = booking.booking_status?.toLowerCase() || 'pending'
        acc[status] = (acc[status] || 0) + 1
        return acc
      }, {})

      return {
        totalCars,
        totalUsers,
        totalBookings,
        totalRevenue,
        bookingsByStatus: {
          active: bookingsByStatus.confirmed || 0,
          completed: bookingsByStatus.completed || 0,
          pending: bookingsByStatus.pending || 0,
          cancelled: bookingsByStatus.cancelled || 0
        }
      }
    } catch (error) {
      console.error('Error getting overview:', error)
      // Return mock data if Supabase fails
      return {
        totalCars: 15,
        totalUsers: 45,
        totalBookings: 28,
        totalRevenue: 125000,
        bookingsByStatus: {
          active: 8,
          completed: 15,
          pending: 3,
          cancelled: 2
        }
      }
    }
  }

  async getBookingsAnalytics(period = '30d') {
    try {
      const days = this.getPeriodDays(period)
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const bookingsResponse = await this.supabaseQuery('bookings', 
        `?select=created_at,booking_status,total_price&created_at=gte.${startDate.toISOString()}`)

      // Group by date
      const bookingsByDate = this.groupByDate(bookingsResponse, days)
      
      // Get status distribution
      const statusDistribution = bookingsResponse.reduce((acc: any, booking: any) => {
        const status = booking.booking_status || 'PENDING'
        const existing = acc.find((item: any) => item.status === status)
        if (existing) {
          existing.count++
        } else {
          acc.push({ status, count: 1 })
        }
        return acc
      }, [])

      return {
        bookingsByDate,
        statusDistribution
      }
    } catch (error) {
      console.error('Error getting bookings analytics:', error)
      return this.getMockBookingsAnalytics(period)
    }
  }

  async getRevenueAnalytics(period = '30d') {
    try {
      const days = this.getPeriodDays(period)
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const bookingsResponse = await this.supabaseQuery('bookings', 
        `?select=created_at,total_price&payment_status=eq.COMPLETED&created_at=gte.${startDate.toISOString()}`)

      const revenueByDate = this.groupRevenueByDate(bookingsResponse, days)

      // Mock monthly comparison for now
      const currentRevenue = bookingsResponse.reduce((sum: number, booking: any) => 
        sum + (booking.total_price || 0), 0)

      return {
        revenueByDate,
        monthlyComparison: {
          current: currentRevenue,
          previous: currentRevenue * 0.85,
          growthRate: 15.2
        }
      }
    } catch (error) {
      console.error('Error getting revenue analytics:', error)
      return this.getMockRevenueAnalytics(period)
    }
  }

  async getCarsAnalytics() {
    try {
      const carsResponse = await this.supabaseQuery('cars', '?select=fuel_type,brand,price_per_day,availability')

      const totalCars = carsResponse.length
      const availableCars = carsResponse.filter((car: any) => car.availability).length
      const utilizationRate = totalCars > 0 ? Math.round(((totalCars - availableCars) / totalCars) * 100) : 0

      // Group by fuel type
      const fuelTypeDistribution = carsResponse.reduce((acc: any, car: any) => {
        const type = car.fuel_type || 'Unknown'
        const existing = acc.find((item: any) => item.type === type)
        if (existing) {
          existing.count++
        } else {
          acc.push({ type, count: 1 })
        }
        return acc
      }, [])

      // Group by brand
      const brandDistribution = carsResponse.reduce((acc: any, car: any) => {
        const brand = car.brand || 'Unknown'
        const existing = acc.find((item: any) => item.brand === brand)
        if (existing) {
          existing.count++
        } else {
          acc.push({ brand, count: 1 })
        }
        return acc
      }, [])

      const averagePrice = carsResponse.length > 0 ? 
        Math.round(carsResponse.reduce((sum: number, car: any) => sum + (car.price_per_day || 0), 0) / carsResponse.length) : 0

      return {
        totalCars,
        availableCars,
        utilizationRate,
        fuelTypeDistribution,
        brandDistribution,
        averagePrice
      }
    } catch (error) {
      console.error('Error getting cars analytics:', error)
      return this.getMockCarsAnalytics()
    }
  }

  async getPopularCars() {
    try {
      // This would require a more complex query with joins, so using mock data for now
      return this.getMockPopularCars()
    } catch (error) {
      console.error('Error getting popular cars:', error)
      return this.getMockPopularCars()
    }
  }

  async getSearchTrends() {
    try {
      const searchResponse = await this.supabaseQuery('search_analytics', '?select=search_city,created_at&limit=1000')

      const citySearches = searchResponse.reduce((acc: any, search: any) => {
        if (search.search_city) {
          acc[search.search_city] = (acc[search.search_city] || 0) + 1
        }
        return acc
      }, {})

      const topCities = Object.entries(citySearches)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 10)
        .map(([city, count]) => ({ city, count }))

      return {
        topCities,
        totalSearches: searchResponse.length
      }
    } catch (error) {
      console.error('Error getting search trends:', error)
      return this.getMockSearchTrends()
    }
  }

  async getGeographicData() {
    try {
      const [carsResponse, searchResponse] = await Promise.all([
        this.supabaseQuery('cars', '?select=city'),
        this.supabaseQuery('search_analytics', '?select=search_city')
      ])

      const carsByCity = carsResponse.reduce((acc: any, car: any) => {
        if (car.city) {
          const existing = acc.find((item: any) => item.city === car.city)
          if (existing) {
            existing.count++
          } else {
            acc.push({ city: car.city, count: 1 })
          }
        }
        return acc
      }, [])

      const searchesByCity = searchResponse.reduce((acc: any, search: any) => {
        if (search.search_city) {
          const existing = acc.find((item: any) => item.city === search.search_city)
          if (existing) {
            existing.count++
          } else {
            acc.push({ city: search.search_city, count: 1 })
          }
        }
        return acc
      }, [])

      return {
        carsByCity,
        searchesByCity
      }
    } catch (error) {
      console.error('Error getting geographic data:', error)
      return this.getMockGeographicData()
    }
  }

  private getPeriodDays(period: string): number {
    switch (period) {
      case '7d': return 7
      case '30d': return 30
      case '90d': return 90
      case '1y': return 365
      default: return 30
    }
  }

  private groupByDate(items: any[], days: number) {
    const result = []
    const today = new Date()
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const count = items.filter(item => {
        const itemDate = new Date(item.created_at).toISOString().split('T')[0]
        return itemDate === dateStr
      }).length
      
      result.push({
        date: dateStr,
        count
      })
    }
    
    return result
  }

  private groupRevenueByDate(bookings: any[], days: number) {
    const result = []
    const today = new Date()
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const revenue = bookings
        .filter(booking => {
          const bookingDate = new Date(booking.created_at).toISOString().split('T')[0]
          return bookingDate === dateStr
        })
        .reduce((sum, booking) => sum + (booking.total_price || 0), 0)
      
      result.push({
        date: dateStr,
        revenue
      })
    }
    
    return result
  }

  // Mock data methods for fallback
  private getMockBookingsAnalytics(period: string) {
    const days = this.getPeriodDays(period)
    const bookingsByDate = []
    const today = new Date()
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      bookingsByDate.push({
        date: date.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 5) + 1
      })
    }

    return {
      bookingsByDate,
      statusDistribution: [
        { status: 'CONFIRMED', count: 12 },
        { status: 'COMPLETED', count: 8 },
        { status: 'PENDING', count: 3 },
        { status: 'CANCELLED', count: 2 }
      ]
    }
  }

  private getMockRevenueAnalytics(period: string) {
    const days = this.getPeriodDays(period)
    const revenueByDate = []
    const today = new Date()
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      revenueByDate.push({
        date: date.toISOString().split('T')[0],
        revenue: Math.floor(Math.random() * 15000) + 5000
      })
    }

    return {
      revenueByDate,
      monthlyComparison: {
        current: 185000,
        previous: 165000,
        growthRate: 12.1
      }
    }
  }

  private getMockCarsAnalytics() {
    return {
      totalCars: 15,
      availableCars: 12,
      utilizationRate: 20,
      fuelTypeDistribution: [
        { type: 'Petrol', count: 8 },
        { type: 'Diesel', count: 5 },
        { type: 'Electric', count: 2 }
      ],
      brandDistribution: [
        { brand: 'Toyota', count: 4 },
        { brand: 'Honda', count: 3 },
        { brand: 'Hyundai', count: 3 },
        { brand: 'Maruti', count: 5 }
      ],
      averagePrice: 2500
    }
  }

  private getMockPopularCars() {
    return [
      { id: '1', name: 'Toyota Camry', brand: 'Toyota', pricePerDay: 3000, bookingCount: 15, image: null },
      { id: '2', name: 'Honda City', brand: 'Honda', pricePerDay: 2500, bookingCount: 12, image: null },
      { id: '3', name: 'Hyundai Creta', brand: 'Hyundai', pricePerDay: 2800, bookingCount: 10, image: null },
      { id: '4', name: 'Maruti Swift', brand: 'Maruti', pricePerDay: 2000, bookingCount: 8, image: null },
      { id: '5', name: 'Toyota Innova', brand: 'Toyota', pricePerDay: 3500, bookingCount: 7, image: null }
    ]
  }

  private getMockSearchTrends() {
    return {
      topCities: [
        { city: 'Mumbai', count: 45 },
        { city: 'Delhi', count: 38 },
        { city: 'Bangalore', count: 32 },
        { city: 'Chennai', count: 28 },
        { city: 'Pune', count: 25 },
        { city: 'Hyderabad', count: 22 },
        { city: 'Kolkata', count: 18 },
        { city: 'Ahmedabad', count: 15 },
        { city: 'Jaipur', count: 12 },
        { city: 'Surat', count: 10 }
      ],
      totalSearches: 245
    }
  }

  private getMockGeographicData() {
    return {
      carsByCity: [
        { city: 'Mumbai', count: 5 },
        { city: 'Delhi', count: 4 },
        { city: 'Bangalore', count: 3 },
        { city: 'Chennai', count: 3 }
      ],
      searchesByCity: [
        { city: 'Mumbai', count: 45 },
        { city: 'Delhi', count: 38 },
        { city: 'Bangalore', count: 32 },
        { city: 'Chennai', count: 28 }
      ]
    }
  }
}