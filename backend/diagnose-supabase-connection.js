const { PrismaClient } = require('@prisma/client')
const fetch = require('node-fetch')

async function diagnoseSupabaseConnection() {
  console.log('🔍 Comprehensive Supabase Connection Diagnosis\n')
  
  // 1. Check environment variables
  console.log('1. Environment Variables Check:')
  console.log(`   DATABASE_URL: ${process.env.DATABASE_URL?.replace(/:[^:@]*@/, ':***@')}`)
  console.log(`   SUPABASE_URL: ${process.env.SUPABASE_URL}`)
  console.log(`   SUPABASE_ANON_KEY: ${process.env.SUPABASE_ANON_KEY ? 'Present' : 'Missing'}`)
  console.log(`   SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Present' : 'Missing'}\n`)
  
  // 2. Test HTTP connectivity to Supabase
  console.log('2. HTTP Connectivity Test:')
  try {
    const response = await fetch(process.env.SUPABASE_URL)
    console.log(`   ✅ HTTP connection successful: ${response.status}`)
  } catch (error) {
    console.log(`   ❌ HTTP connection failed: ${error.message}`)
    return
  }
  
  // 3. Test Supabase REST API
  console.log('\n3. Supabase REST API Test:')
  try {
    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': process.env.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`
      }
    })
    console.log(`   REST API Response: ${response.status}`)
    if (response.status === 401) {
      console.log('   ⚠️  401 Unauthorized - This is normal for schema access with anon key')
    }
  } catch (error) {
    console.log(`   ❌ REST API failed: ${error.message}`)
  }
  
  // 4. Test database connection with different approaches
  console.log('\n4. Database Connection Tests:')
  
  // Test 1: Direct connection
  console.log('   Test 1: Direct Connection')
  await testDatabaseConnection(process.env.DATABASE_URL, 'Direct')
  
  // Test 2: Connection pooler (session mode)
  const sessionPoolerUrl = process.env.DATABASE_URL.replace(
    'db.gqrwjafrebbgpvkfphzw.supabase.co:5432',
    'aws-0-ap-south-1.pooler.supabase.com:5432'
  ).replace('postgres:', 'postgres.gqrwjafrebbgpvkfphzw:')
  
  console.log('   Test 2: Session Pooler')
  await testDatabaseConnection(sessionPoolerUrl, 'Session Pooler')
  
  // Test 3: Transaction pooler
  const transactionPoolerUrl = process.env.DATABASE_URL.replace(':5432', ':6543')
  console.log('   Test 3: Transaction Pooler')
  await testDatabaseConnection(transactionPoolerUrl, 'Transaction Pooler')
  
  // 5. Check for common issues
  console.log('\n5. Common Issues Check:')
  
  // Check if project might be paused
  console.log('   Checking for project status indicators...')
  try {
    const healthResponse = await fetch(`${process.env.SUPABASE_URL}/rest/v1/health`, {
      headers: {
        'apikey': process.env.SUPABASE_ANON_KEY
      }
    })
    console.log(`   Health endpoint: ${healthResponse.status}`)
  } catch (error) {
    console.log(`   Health check failed: ${error.message}`)
  }
  
  // 6. Network diagnostics
  console.log('\n6. Network Diagnostics:')
  console.log('   Possible causes of connection failure:')
  console.log('   - Supabase project is paused (free tier limitation)')
  console.log('   - IP address not whitelisted in Supabase dashboard')
  console.log('   - Incorrect database credentials')
  console.log('   - Network firewall blocking PostgreSQL port 5432')
  console.log('   - DNS resolution issues')
  console.log('   - Supabase service outage')
  
  console.log('\n7. Recommendations:')
  console.log('   1. Check Supabase dashboard for project status')
  console.log('   2. Verify IP whitelist in Supabase Settings > Database')
  console.log('   3. Try using connection pooler instead of direct connection')
  console.log('   4. Check if project has been paused due to inactivity')
  console.log('   5. Verify database password is correct')
}

async function testDatabaseConnection(connectionUrl, connectionType) {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: connectionUrl
      }
    },
    log: ['error']
  })
  
  try {
    await prisma.$connect()
    console.log(`   ✅ ${connectionType} connection successful`)
    
    // Try a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log(`   ✅ ${connectionType} query successful`)
    
    await prisma.$disconnect()
  } catch (error) {
    console.log(`   ❌ ${connectionType} connection failed: ${error.message}`)
    
    // Analyze error type
    if (error.code === 'P1001') {
      console.log(`   📋 P1001 Error Analysis:`)
      console.log(`      - Cannot reach database server`)
      console.log(`      - Possible causes: Project paused, IP not whitelisted, network issues`)
    } else if (error.message.includes('password authentication failed')) {
      console.log(`   📋 Authentication Error:`)
      console.log(`      - Database password is incorrect`)
      console.log(`      - Check credentials in Supabase dashboard`)
    } else if (error.message.includes('Tenant or user not found')) {
      console.log(`   📋 Tenant Error:`)
      console.log(`      - Project reference might be incorrect`)
      console.log(`      - Connection string format issue`)
    }
  }
}

// Load environment variables
require('dotenv').config()
diagnoseSupabaseConnection()