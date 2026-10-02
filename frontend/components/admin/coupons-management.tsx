'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Gift,
  Calendar,
  Percent,
  IndianRupee
} from 'lucide-react'
import { ClientOnly } from '@/components/client-only'
import authenticatedAPI from '@/lib/authenticated-api'
import toast from 'react-hot-toast'

interface Coupon {
  id: string
  code: string
  discount: number
  discountType: string
  minAmount?: number
  maxDiscount?: number
  validFrom: string
  validTo: string
  usageLimit?: number
  usedCount: number
  active: boolean
  createdAt: string
  updatedAt: string
}

export function CouponsManagement() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [formData, setFormData] = useState({
    code: '',
    discount: '',
    discountType: 'PERCENTAGE',
    minAmount: '',
    maxDiscount: '',
    validFrom: '',
    validTo: '',
    usageLimit: '',
    active: true
  })

  // Fetch coupons
  useEffect(() => {
    fetchCoupons()
    const interval = setInterval(fetchCoupons, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchCoupons = async () => {
    try {
      setLoading(true)
      const response = await authenticatedAPI.get('/coupons')
      const raw: any[] = Array.isArray(response) ? response : response.coupons || []
      const mapped = raw.map((c) => ({
        id: c.id,
        code: c.code,
        discount: c.discount,
        discountType: c.discount_type || c.discountType,
        minAmount: c.min_amount ?? c.minAmount,
        maxDiscount: c.max_discount ?? c.maxDiscount,
        validFrom: c.valid_from || c.validFrom,
        validTo: c.valid_to || c.validTo,
        usageLimit: c.usage_limit ?? c.usageLimit,
        usedCount: c.used_count ?? c.usedCount ?? 0,
        active: c.active,
        createdAt: c.created_at || c.createdAt,
        updatedAt: c.updated_at || c.updatedAt,
      }))
      setCoupons(mapped)
    } catch (error) {
      console.error('Error fetching coupons:', error)
      toast.error('Failed to fetch coupons')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const submitData = {
        ...formData,
        discount: parseFloat(formData.discount),
        minAmount: formData.minAmount ? parseFloat(formData.minAmount) : undefined,
        maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : undefined,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
      }

      if (editingCoupon) {
        // Update existing coupon
        await authenticatedAPI.patch(`/coupons/${editingCoupon.id}`, submitData)
        toast.success('Coupon updated successfully!')
      } else {
        // Create new coupon
        await authenticatedAPI.post('/coupons', submitData)
        toast.success('Coupon created successfully!')
      }
      
      // Reset form and refresh list
      resetForm()
      fetchCoupons()
    } catch (error: any) {
      console.error('Error saving coupon:', error)
      toast.error(error.response?.data?.message || 'Failed to save coupon')
    }
  }

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon)
    setFormData({
      code: coupon.code,
      discount: coupon.discount.toString(),
      discountType: coupon.discountType,
      minAmount: coupon.minAmount?.toString() || '',
      maxDiscount: coupon.maxDiscount?.toString() || '',
      validFrom: coupon.validFrom ? new Date(coupon.validFrom).toISOString().split('T')[0] : '',
      validTo: coupon.validTo ? new Date(coupon.validTo).toISOString().split('T')[0] : '',
      usageLimit: coupon.usageLimit?.toString() || '',
      active: coupon.active
    })
    setShowAddForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return
    
    try {
      await authenticatedAPI.delete(`/coupons/${id}`)
      toast.success('Coupon deleted successfully!')
      fetchCoupons()
    } catch (error: any) {
      console.error('Error deleting coupon:', error)
      toast.error('Failed to delete coupon')
    }
  }

  const resetForm = () => {
    setFormData({
      code: '',
      discount: '',
      discountType: 'PERCENTAGE',
      minAmount: '',
      maxDiscount: '',
      validFrom: '',
      validTo: '',
      usageLimit: '',
      active: true
    })
    setEditingCoupon(null)
    setShowAddForm(false)
  }

  const filteredCoupons = coupons.filter(coupon =>
    coupon.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (showAddForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            {editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}
          </h1>
          <Button variant="outline" onClick={resetForm}>
            Cancel
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Coupon Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Coupon Code *</label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    placeholder="e.g., SAVE20, WELCOME10"
                    required
                    disabled={!!editingCoupon}
                    className={editingCoupon ? 'bg-gray-100' : ''}
                  />
                  {editingCoupon && (
                    <p className="text-xs text-gray-500">Coupon code cannot be changed when editing</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Discount Type *</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({...formData, discountType: e.target.value})}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Fixed Amount (₹)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Discount Value * ({formData.discountType === 'PERCENTAGE' ? '%' : '₹'})
                  </label>
                  <Input
                    type="number"
                    value={formData.discount}
                    onChange={(e) => setFormData({...formData, discount: e.target.value})}
                    placeholder={formData.discountType === 'PERCENTAGE' ? '10' : '500'}
                    min="0"
                    max={formData.discountType === 'PERCENTAGE' ? '100' : undefined}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Minimum Amount (₹)</label>
                  <Input
                    type="number"
                    value={formData.minAmount}
                    onChange={(e) => setFormData({...formData, minAmount: e.target.value})}
                    placeholder="1000"
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Maximum Discount (₹)</label>
                  <Input
                    type="number"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({...formData, maxDiscount: e.target.value})}
                    placeholder="2000"
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Valid From *</label>
                  <Input
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({...formData, validFrom: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Valid To *</label>
                  <Input
                    type="date"
                    value={formData.validTo}
                    onChange={(e) => setFormData({...formData, validTo: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Usage Limit</label>
                <Input
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({...formData, usageLimit: e.target.value})}
                  placeholder="Leave empty for unlimited usage"
                  min="1"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({...formData, active: e.target.checked})}
                  className="rounded"
                />
                <label htmlFor="active" className="text-sm font-medium">
                  Active (users can use this coupon)
                </label>
              </div>

              <div className="flex space-x-4">
                <Button type="submit" className="flex-1">
                  {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Coupons Management</h1>
        <Button onClick={() => setShowAddForm(true)}>
          <ClientOnly fallback={<div className="w-4 h-4 mr-2" />}>
            <Plus className="w-4 h-4 mr-2" />
          </ClientOnly>
          Add New Coupon
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <ClientOnly fallback={<div className="w-4 h-4" />}>
              <Search className="w-4 h-4 text-gray-400" />
            </ClientOnly>
            <Input
              placeholder="Search coupons by code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Coupons List */}
      <Card>
        <CardHeader>
          <CardTitle>All Coupons ({filteredCoupons.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading coupons...</p>
            </div>
          ) : filteredCoupons.length === 0 ? (
            <div className="text-center py-8">
              <ClientOnly fallback={<div className="w-12 h-12 mx-auto mb-4" />}>
                <Gift className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              </ClientOnly>
              <p className="text-gray-600">No coupons found</p>
              <Button onClick={() => setShowAddForm(true)} className="mt-4">
                Create Your First Coupon
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCoupons.map((coupon) => (
                <div key={coupon.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-lg font-mono">{coupon.code}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          coupon.active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {coupon.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="flex items-center space-x-1">
                          <ClientOnly fallback={<div className="w-4 h-4" />}>
                            {coupon.discountType === 'PERCENTAGE' ? (
                              <Percent className="w-4 h-4 text-blue-600" />
                            ) : (
                              <IndianRupee className="w-4 h-4 text-green-600" />
                            )}
                          </ClientOnly>
                          <span className="font-medium">
                            {coupon.discount}{coupon.discountType === 'PERCENTAGE' ? '%' : '₹'} off
                          </span>
                        </div>
                        {coupon.minAmount && (
                          <span className="text-sm text-gray-600">
                            Min: ₹{coupon.minAmount}
                          </span>
                        )}
                        {coupon.maxDiscount && (
                          <span className="text-sm text-gray-600">
                            Max: ₹{coupon.maxDiscount}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <ClientOnly fallback={<div className="w-3 h-3" />}>
                            <Calendar className="w-3 h-3" />
                          </ClientOnly>
                          <span>
                            {coupon.validFrom ? new Date(coupon.validFrom).toLocaleDateString() : 'N/A'} - {coupon.validTo ? new Date(coupon.validTo).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                        <span>
                          Used: {coupon.usedCount}{coupon.usageLimit ? `/${coupon.usageLimit}` : ''}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(coupon)}
                      >
                        <ClientOnly fallback={<div className="w-4 h-4" />}>
                          <Edit className="w-4 h-4" />
                        </ClientOnly>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(coupon.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <ClientOnly fallback={<div className="w-4 h-4" />}>
                          <Trash2 className="w-4 h-4" />
                        </ClientOnly>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}