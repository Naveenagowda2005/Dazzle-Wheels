import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ImageSlider } from '@/components/ui/image-slider'
import { Fuel, Users, MapPin, Clock } from 'lucide-react'
import { formatCurrency, calculatePrice } from '@/lib/utils'
import { ClientOnly } from '@/components/client-only'

interface Car {
  id: string
  name: string
  brand: string
  fuelType: string
  seats: number
  pricePerHour: number
  pricePerDay: number
  city: string
  images: string[]
  description?: string
}

interface CarCardProps {
  car: Car
  viewMode: 'grid' | 'list'
  pickupDate?: string
  dropDate?: string
}

export function CarCard({ car, viewMode, pickupDate, dropDate }: CarCardProps) {
  const totalPrice = pickupDate && dropDate 
    ? calculatePrice(car.pricePerHour, car.pricePerDay, pickupDate, dropDate)
    : null

  if (viewMode === 'list') {
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="flex">
          <div className="w-1/3">
            <div className="h-48">
              <ImageSlider images={car.images} alt={car.name} />
            </div>
          </div>
          <CardContent className="w-2/3 p-6">
            <div className="flex justify-between items-start h-full">
              <div className="space-y-3 flex-1">
                <div>
                  <h3 className="font-semibold text-xl text-gray-900">{car.name}</h3>
                  <p className="text-gray-600">{car.brand}</p>
                </div>
                
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <ClientOnly fallback={<div className="w-4 h-4" />}>
                      <Fuel className="w-4 h-4" />
                    </ClientOnly>
                    <span>{car.fuelType}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <ClientOnly fallback={<div className="w-4 h-4" />}>
                      <Users className="w-4 h-4" />
                    </ClientOnly>
                    <span>{car.seats} Seats</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <ClientOnly fallback={<div className="w-4 h-4" />}>
                      <MapPin className="w-4 h-4" />
                    </ClientOnly>
                    <span>{car.city}</span>
                  </div>
                </div>
                
                {car.description && (
                  <p className="text-gray-600 text-sm line-clamp-2">{car.description}</p>
                )}
              </div>
              
              <div className="text-right ml-6">
                <div className="mb-4">
                  {totalPrice ? (
                    <div>
                      <span className="text-2xl font-bold text-blue-600">
                        {formatCurrency(totalPrice)}
                      </span>
                      <span className="text-sm text-gray-600 block">Total</span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-2xl font-bold text-blue-600">
                        {formatCurrency(car.pricePerDay)}
                      </span>
                      <span className="text-sm text-gray-600 block">/day</span>
                    </div>
                  )}
                  <div className="text-sm text-gray-500 mt-1">
                    <ClientOnly fallback={<div className="w-3 h-3 inline mr-1" />}>
                      <Clock className="w-3 h-3 inline mr-1" />
                    </ClientOnly>
                    {formatCurrency(car.pricePerHour)}/hr
                  </div>
                </div>
                <Link href={`/cars/${car.id}${pickupDate && dropDate ? `?pickup=${pickupDate}&drop=${dropDate}` : ''}`}>
                  <Button>Book Now</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48">
        <ImageSlider images={car.images} alt={car.name} />
      </div>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg text-gray-900">{car.name}</h3>
            <p className="text-sm text-gray-600">{car.brand}</p>
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <ClientOnly fallback={<div className="w-4 h-4" />}>
                <Fuel className="w-4 h-4" />
              </ClientOnly>
              <span>{car.fuelType}</span>
            </div>
            <div className="flex items-center space-x-1">
              <ClientOnly fallback={<div className="w-4 h-4" />}>
                <Users className="w-4 h-4" />
              </ClientOnly>
              <span>{car.seats}</span>
            </div>
            <div className="flex items-center space-x-1">
              <ClientOnly fallback={<div className="w-4 h-4" />}>
                <MapPin className="w-4 h-4" />
              </ClientOnly>
              <span>{car.city}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              {totalPrice ? (
                <div>
                  <span className="text-xl font-bold text-blue-600">
                    {formatCurrency(totalPrice)}
                  </span>
                  <span className="text-xs text-gray-600 block">Total</span>
                </div>
              ) : (
                <div>
                  <span className="text-xl font-bold text-blue-600">
                    {formatCurrency(car.pricePerDay)}
                  </span>
                  <span className="text-xs text-gray-600">/day</span>
                </div>
              )}
            </div>
            <Link href={`/cars/${car.id}${pickupDate && dropDate ? `?pickup=${pickupDate}&drop=${dropDate}` : ''}`}>
              <Button size="sm">Book Now</Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}