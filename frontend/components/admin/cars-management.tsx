'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Edit, Trash2, Eye } from 'lucide-react'
import authenticatedAPI from '@/lib/authenticated-api'
import { formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Car {
  id: string
  name: string
  brand: string
  fuelType: string
  seats: number
  pricePerHour: number
  pricePerDay: number
  city: string
  description?: string
  images: string[]
  availability: boolean
  createdAt: string
}

export function CarsManagement() {
  const [page, setPage] = useState(1)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [selectedCar, setSelectedCar] = useState<Car | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery(['admin-cars', page], async () => {
    return await authenticatedAPI.get(`/cars?page=${page}&limit=10`)
  }, {
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
    staleTime: 0,
  })

  const deleteMutation = useMutation(
    (id: string) => authenticatedAPI.delete(`/cars/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-cars'])
        toast.success('Car deleted successfully')
      },
      onError: (error: any) => {
        const msg = error?.message || 'Failed to delete car'
        toast.error(msg)
      }
    }
  )

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      deleteMutation.mutate(id)
    }
  }

  const handleView = (car: Car) => {
    setSelectedCar(car)
    setShowViewModal(true)
  }

  const handleEdit = (car: Car) => {
    setSelectedCar(car)
    setShowEditForm(true)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Cars Management</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Cars Management</h1>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Car
        </Button>
      </div>

      {/* Cars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.cars?.map((car: Car) => (
          <Card key={car.id} className="overflow-hidden">
            <div className="relative h-48">
              <img
                src={car.images[0] || 'https://images.unsplash.com/photo-1549924231-f129b911e442?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'}
                alt={car.name}
                className="w-full h-full object-cover"
              />
              <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${
                car.availability 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {car.availability ? 'Available' : 'Unavailable'}
              </div>
            </div>
            
            <CardContent className="p-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{car.name}</h3>
                <p className="text-sm text-gray-600">{car.brand} • {car.city}</p>
                <p className="text-sm text-gray-600">{car.fuelType} • {car.seats} Seats</p>
                
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-lg font-bold text-blue-600">
                      {formatCurrency(car.pricePerDay)}/day
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatCurrency(car.pricePerHour)}/hr
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2 pt-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleView(car)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleEdit(car)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    onClick={() => handleDelete(car.id, car.name)}
                    disabled={deleteMutation.isLoading}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {data?.pagination?.pages > 1 && (
        <div className="flex justify-center space-x-2">
          {[...Array(data.pagination.pages)].map((_, i) => (
            <Button
              key={i}
              variant={page === i + 1 ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </Button>
          ))}
        </div>
      )}

      {/* Modals */}
      {showAddForm && (
        <AddCarForm onClose={() => setShowAddForm(false)} />
      )}

      {showViewModal && selectedCar && (
        <ViewCarModal car={selectedCar} onClose={() => setShowViewModal(false)} />
      )}

      {showEditForm && selectedCar && (
        <EditCarForm car={selectedCar} onClose={() => setShowEditForm(false)} />
      )}
    </div>
  )
}

// Add Car Form Component
function AddCarForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    fuelType: 'Petrol',
    seats: 5,
    pricePerHour: 0,
    pricePerDay: 0,
    city: 'Bangalore',
    description: '',
    availability: true
  })
  
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  const queryClient = useQueryClient()

  const createMutation = useMutation(
    (data: FormData) => {
      return fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/cars`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${JSON.parse(localStorage.getItem('dazzle_session') || '{}').access_token}`
        },
        body: data
      }).then(response => {
        if (!response.ok) {
          return response.json().then(errorData => {
            throw new Error(errorData.message || `HTTP ${response.status}: Failed to create car`)
          })
        }
        return response.json()
      })
    },
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries(['admin-cars'])
        if (selectedImages.length > 0) {
          toast.success('Car added successfully with images!')
        } else {
          toast.success('Car added successfully!')
        }
        onClose()
      },
      onError: (error: any) => {
        console.error('Create error:', error)
        const errorMessage = error.message || 'Failed to add car'
        toast.error(errorMessage)
      }
    }
  )

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Limit to 10 images
    const limitedFiles = files.slice(0, 10)
    setSelectedImages(prev => [...prev, ...limitedFiles].slice(0, 10))

    // Create previews
    limitedFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string].slice(0, 10))
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const formDataToSend = new FormData()
    
    // Append form fields
    Object.entries(formData).forEach(([key, value]) => {
      formDataToSend.append(key, value.toString())
    })
    
    // Append images
    selectedImages.forEach((file) => {
      formDataToSend.append('images', file)
    })
    
    createMutation.mutate(formDataToSend)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Add New Car</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Car Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Brand</label>
                <Input
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Fuel Type</label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={formData.fuelType}
                  onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                >
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Electric">Electric</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Seats</label>
                <Input
                  type="number"
                  min="2"
                  max="8"
                  value={formData.seats}
                  onChange={(e) => setFormData({ ...formData, seats: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Price per Hour (₹)</label>
                <Input
                  type="number"
                  min="0"
                  value={formData.pricePerHour}
                  onChange={(e) => setFormData({ ...formData, pricePerHour: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Price per Day (₹)</label>
                <Input
                  type="number"
                  min="0"
                  value={formData.pricePerDay}
                  onChange={(e) => setFormData({ ...formData, pricePerDay: parseFloat(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                className="w-full p-2 border rounded-md"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Image Upload Section */}
            <div>
              <label className="block text-sm font-medium mb-2">Car Images</label>
              <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                <strong>Storage:</strong> Images will be stored in Supabase Storage when properly configured, otherwise fallback placeholder images will be used.
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                      </svg>
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> car images
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 10 images)</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>

                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Selected Images ({imagePreviews.length}/10)</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="availability"
                checked={formData.availability}
                onChange={(e) => setFormData({ ...formData, availability: e.target.checked })}
              />
              <label htmlFor="availability" className="text-sm font-medium">
                Available for booking
              </label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isLoading}>
                {createMutation.isLoading ? 'Adding...' : 'Add Car'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

// View Car Modal Component
function ViewCarModal({ car, onClose }: { car: Car; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Car Details - {car.name}</span>
            <Button variant="outline" size="sm" onClick={onClose}>
              ✕
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Car Images */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Images</h3>
              <div className="grid grid-cols-2 gap-2">
                {car.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${car.name} ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>

            {/* Car Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Specifications</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Car Name</label>
                  <p className="text-lg">{car.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Brand</label>
                  <p className="text-lg">{car.brand}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Fuel Type</label>
                  <p className="text-lg">{car.fuelType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Seats</label>
                  <p className="text-lg">{car.seats}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">City</label>
                  <p className="text-lg">{car.city}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Availability</label>
                  <p className={`text-lg font-medium ${car.availability ? 'text-green-600' : 'text-red-600'}`}>
                    {car.availability ? 'Available' : 'Unavailable'}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Pricing</label>
                <div className="mt-1">
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(car.pricePerDay)}/day
                  </p>
                  <p className="text-lg text-gray-600">
                    {formatCurrency(car.pricePerHour)}/hour
                  </p>
                </div>
              </div>

              {car.description && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Description</label>
                  <p className="mt-1 text-gray-800">{car.description}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-600">Created</label>
                <p className="text-sm text-gray-600">
                  {new Date(car.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Edit Car Form Component
function EditCarForm({ car, onClose }: { car: Car; onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: car.name,
    brand: car.brand,
    fuelType: car.fuelType,
    seats: car.seats,
    pricePerHour: car.pricePerHour,
    pricePerDay: car.pricePerDay,
    city: car.city,
    description: car.description || '',
    availability: car.availability
  })

  const queryClient = useQueryClient()

  const updateMutation = useMutation(
    (data: any) => {
      const formDataToSend = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formDataToSend.append(key, value.toString())
        }
      })
      return fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/cars/${car.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${JSON.parse(localStorage.getItem('dazzle_session') || '{}').access_token}`
        },
        body: formDataToSend
      }).then(res => {
        if (!res.ok) return res.json().then(e => { throw new Error(e.message || 'Failed to update car') })
        return res.json()
      })
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['admin-cars'])
        toast.success('Car updated successfully')
        onClose()
      },
      onError: (error: any) => {
        console.error('Update error:', error)
        const errorMessage = error.message || 'Failed to update car'
        toast.error(errorMessage)
      }
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateMutation.mutate(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Edit Car - {car.name}</span>
            <Button variant="outline" size="sm" onClick={onClose}>
              ✕
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Car Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Brand</label>
                <Input
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Fuel Type</label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={formData.fuelType}
                  onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                >
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Electric">Electric</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Seats</label>
                <Input
                  type="number"
                  min="2"
                  max="8"
                  value={formData.seats}
                  onChange={(e) => setFormData({ ...formData, seats: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Price per Hour (₹)</label>
                <Input
                  type="number"
                  min="0"
                  value={formData.pricePerHour}
                  onChange={(e) => setFormData({ ...formData, pricePerHour: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Price per Day (₹)</label>
                <Input
                  type="number"
                  min="0"
                  value={formData.pricePerDay}
                  onChange={(e) => setFormData({ ...formData, pricePerDay: parseFloat(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                className="w-full p-2 border rounded-md"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="availability"
                checked={formData.availability}
                onChange={(e) => setFormData({ ...formData, availability: e.target.checked })}
              />
              <label htmlFor="availability" className="text-sm font-medium">
                Available for booking
              </label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isLoading}>
                {updateMutation.isLoading ? 'Updating...' : 'Update Car'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}