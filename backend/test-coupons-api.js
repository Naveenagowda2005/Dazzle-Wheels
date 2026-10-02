const axios = require('axios')

const BASE_URL = 'http://localhost:3001'

async function testCouponsAPI() {
  try {
    console.log('Testing coupons API...')
    
    // Test public endpoint
    console.log('\n1. Testing public active coupons endpoint...')
    const response = await axios.get(`${BASE_URL}/api/coupons/active/public`)
    console.log('✅ Public coupons endpoint works!')
    console.log('Active coupons:', response.data.length)
    
    if (response.data.length > 0) {
      console.log('Sample coupon:', {
        code: response.data[0].code,
        discount: response.data[0].discount,
        discountType: response.data[0].discountType
      })
    }
    
  } catch (error) {
    console.error('❌ Error testing coupons API:', error.response?.data || error.message)
  }
}

testCouponsAPI()