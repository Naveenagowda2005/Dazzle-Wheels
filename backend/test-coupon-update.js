const axios = require('axios')

const BASE_URL = 'http://localhost:3001/api'

async function testCouponUpdate() {
  try {
    console.log('Testing coupon update...')
    
    // First, login as admin to get token
    console.log('\n1. Logging in as admin...')
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@dazzlewheels.com',
      password: 'DazzleAdmin@2024!'
    })
    
    const token = loginResponse.data.access_token
    console.log('✅ Login successful')
    
    // Get all coupons to find one to update
    console.log('\n2. Getting coupons...')
    const couponsResponse = await axios.get(`${BASE_URL}/coupons`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    const coupons = couponsResponse.data.coupons
    if (coupons.length === 0) {
      console.log('❌ No coupons found to update')
      return
    }
    
    const couponToUpdate = coupons[0]
    console.log('✅ Found coupon to update:', couponToUpdate.code)
    
    // Try to update the coupon
    console.log('\n3. Updating coupon...')
    const updateData = {
      code: couponToUpdate.code,
      discount: couponToUpdate.discount,
      discountType: couponToUpdate.discountType,
      minAmount: couponToUpdate.minAmount,
      maxDiscount: couponToUpdate.maxDiscount,
      validFrom: new Date(couponToUpdate.validFrom),
      validTo: new Date(couponToUpdate.validTo),
      usageLimit: couponToUpdate.usageLimit,
      active: couponToUpdate.active
    }
    
    console.log('Update data:', updateData)
    
    const updateResponse = await axios.patch(`${BASE_URL}/coupons/${couponToUpdate.id}`, updateData, {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    console.log('✅ Coupon updated successfully!')
    console.log('Updated coupon:', updateResponse.data)
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message)
    if (error.response?.data) {
      console.error('Full error response:', JSON.stringify(error.response.data, null, 2))
    }
  }
}

testCouponUpdate()