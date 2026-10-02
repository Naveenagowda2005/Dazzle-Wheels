import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useQuery } from 'react-query'
import api from '@/lib/api'

interface FiltersProps {
  filters: {
    city: string
    fuelType: string
    seats: string
    minPrice: string
    maxPrice: string
    pickupDate: string
    dropDate: string
  }
  onFiltersChange: (filters: any) => void
}

export function CarFilters({ filters, onFiltersChange }: FiltersProps) {
  const { data: cities, isLoading: citiesLoading, error: citiesError } = useQuery('cities', async () => {
    try {
      const response = await api.get('/cars/cities')
      return response.data || []
    } catch (error) {
      console.error('Failed to fetch cities:', error)
      return []
    }
  }, {
    retry: 2,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  })

  const { data: fuelTypes, isLoading: fuelTypesLoading } = useQuery('fuelTypes', async () => {
    try {
      const response = await api.get('/cars/fuel-types')
      return response.data || []
    } catch (error) {
      console.error('Failed to fetch fuel types:', error)
      return []
    }
  }, {
    retry: 2,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  })

  const { data: seatOptions, isLoading: seatsLoading } = useQuery('seats', async () => {
    try {
      const response = await api.get('/cars/seats')
      return response.data || []
    } catch (error) {
      console.error('Failed to fetch seats:', error)
      return []
    }
  }, {
    retry: 2,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  })

  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFiltersChange({
      city: '',
      fuelType: '',
      seats: '',
      minPrice: '',
      maxPrice: '',
      pickupDate: '',
      dropDate: '',
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">City</label>
          <select
            className="w-full p-2 border rounded-md"
            value={filters.city}
            onChange={(e) => handleFilterChange('city', e.target.value)}
          >
            <option value="">All Cities</option>
            {citiesLoading && <option disabled>Loading cities...</option>}
            {!!citiesError && <option disabled>Error loading cities</option>}
            {Array.isArray(cities) && cities.map((city: string) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Fuel Type</label>
          <select
            className="w-full p-2 border rounded-md"
            value={filters.fuelType}
            onChange={(e) => handleFilterChange('fuelType', e.target.value)}
          >
            <option value="">All Types</option>
            {fuelTypesLoading && <option disabled>Loading fuel types...</option>}
            {Array.isArray(fuelTypes) && fuelTypes.map((fuelType: string) => (
              <option key={fuelType} value={fuelType}>{fuelType}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Seats</label>
          <select
            className="w-full p-2 border rounded-md"
            value={filters.seats}
            onChange={(e) => handleFilterChange('seats', e.target.value)}
          >
            <option value="">Any</option>
            {seatsLoading && <option disabled>Loading seat options...</option>}
            {Array.isArray(seatOptions) && seatOptions.map((seats: number) => (
              <option key={seats} value={seats.toString()}>
                {seats} {seats === 1 ? 'Seater' : 'Seaters'}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Price Range (per day)</label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            />
            <Input
              type="number"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Pickup Date</label>
          <Input
            type="datetime-local"
            value={filters.pickupDate}
            onChange={(e) => handleFilterChange('pickupDate', e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Drop Date</label>
          <Input
            type="datetime-local"
            value={filters.dropDate}
            onChange={(e) => handleFilterChange('dropDate', e.target.value)}
          />
        </div>

        <Button variant="outline" onClick={clearFilters} className="w-full">
          Clear Filters
        </Button>
      </CardContent>
    </Card>
  )
}