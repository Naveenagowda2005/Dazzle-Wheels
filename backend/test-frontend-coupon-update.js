const axios = require('axios')

const BASE_URL = 'http://localhost:3001/api'

async function testFrontendCouponUpdate() {
  try {
    console.log('Testing frontend coupon update simulation...')
    
    // Login as admin
    console.log('\n1. Logging in as admin...')
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@dazzlewheels.com',
      password: 'DazzleAdmin@2024!'
    })
    
    const token = loginResponse.data.access_token
    console.log('✅ Login successful')
    
    // Get coupons
    console.log('\n2. Getting coupons...')
    const couponsResponse = await axios.get(`${BASE_URL}/coupons`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    const coupons = couponsResponse.data.coupons
    const couponToUpdate = coupons[0]
    console.log('✅ Found coupon to update:', couponToUpdate.code)
    
    // Simulate frontend form data (exactly as frontend sends it)
    console.log('\n3. Simulating frontend form submission...')
    const frontendFormData = {
      code: couponToUpdate.code, // Keep the same code
      discount: '15', // String as it comes from form
      discountType: 'PERCENTAGE',
      minAmount: '800', // String as it comes from form
      maxDiscount: '150', // String as it comes from form
      validFrom: '2026-03-16', // Date string from date input
      validTo: '2026-05-15', // Date string from date input
      usageLimit: '400', // String as it comes from form
      active: true
    }
    
    // Transform data as frontend does
    const submitData = {
      ...frontendFormData,
      discount: parseFloat(frontendFormData.discount),
      minAmount: frontendFormData.minAmount ? parseFloat(frontendFormData.minAmount) : undefined,
      maxDiscount: frontendFormData.maxDiscount ? parseFloat(frontendFormData.maxDiscount) : undefined,
      usageLimit: frontendFormData.usageLimit ? parseInt(frontendFormData.usageLimit) : undefined,
    }
    
    console.log('Frontend form data:', frontendFormData)
    console.log('Transformed submit data:', submitData)
    
    // Try to update
    const updateResponse = await axios.patch(`${BASE_URL}/coupons/${couponToUpdate.id}`, submitData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('✅ Coupon updated successfully!')
    console.log('Response:', updateResponse.data)
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message)
    if (error.response?.data) {
      console.error('Full error response:', JSON.stringify(error.response.data, null, 2))
    }
  }
}

testFrontendCouponUpdate()