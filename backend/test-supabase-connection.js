const { PrismaClient } = require('@prisma/client')
const https = require('https')

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...')
  
  // First test if we can reach the Supabase URL
  const supabaseUrl = process.env.SUPABASE_URL || 'https://gqrwjafrebbgpvkfphzw.supabase.co'
  console.log(`Testing HTTP connection to: ${supabaseUrl}`)
  
  try {
    const response = await fetch(supabaseUrl)
    console.log(`✅ HTTP connection successful: ${response.status}`)
  } catch (error) {
    console.log(`❌ HTTP connection failed: ${error.message}`)
  }
  
  // Test database connection with detailed error handling
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  })
  
  try {
    console.log('\n🔍 Testing database connection...')
    console.log('DATABASE_URL:', process.env.DATABASE_URL?.replace(/:[^:@]*@/, ':***@'))
    
    // Test connection
    await prisma.$connect()
    console.log('✅ Prisma connection successful')
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Database query successful:', result)
    
    // Try to count users
    const userCount = await prisma.user.count()
    console.log(`✅ User count: ${userCount}`)
    
  } catch (error) {
    console.error('❌ Database connection failed:')
    console.error('Error code:', error.code)
    console.error('Error message:', error.message)
    
    if (error.code === 'P1001') {
      console.log('\n🔧 Troubleshooting P1001 error:')
      console.log('- Check if Supabase project is active')
      console.log('- Verify database URL is correct')
      console.log('- Check if IP is whitelisted in Supabase')
      console.log('- Ensure database is not paused')
    }
  } finally {
    await prisma.$disconnect()
  }
}

testSupabaseConnection()