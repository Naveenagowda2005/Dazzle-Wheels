const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testDatabaseConnection() {
  try {
    console.log('🔍 Testing Supabase database connection...')
    
    // Test basic connection
    await prisma.$connect()
    console.log('✅ Database connection successful')
    
    // Check if tables exist and have data
    const [userCount, carCount, bookingCount, searchCount] = await Promise.all([
      prisma.user.count(),
      prisma.car.count(),
      prisma.booking.count(),
      prisma.searchAnalytics.count()
    ])
    
    console.log('\n📊 Database Statistics:')
    console.log(`- Users: ${userCount}`)
    console.log(`- Cars: ${carCount}`)
    console.log(`- Bookings: ${bookingCount}`)
    console.log(`- Search Analytics: ${searchCount}`)
    
    // Test analytics queries
    console.log('\n🧪 Testing Analytics Queries...')
    
    // Test overview query
    const totalRevenue = await prisma.booking.aggregate({
      _sum: { totalPrice: true },
      where: { paymentStatus: 'COMPLETED' }
    })
    console.log(`- Total Revenue: ₹${totalRevenue._sum.totalPrice || 0}`)
    
    // Test booking status distribution
    const statusDistribution = await prisma.booking.groupBy({
      by: ['bookingStatus'],
      _count: { bookingStatus: true }
    })
    console.log('- Booking Status Distribution:')
    statusDistribution.forEach(item => {
      console.log(`  ${item.bookingStatus}: ${item._count.bookingStatus}`)
    })
    
    // Test recent bookings
    const recentBookings = await prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        bookingId: true,
        totalPrice: true,
        bookingStatus: true,
        paymentStatus: true,
        createdAt: true
      }
    })
    console.log('\n📋 Recent Bookings:')
    recentBookings.forEach(booking => {
      console.log(`  ${booking.bookingId}: ₹${booking.totalPrice} - ${booking.bookingStatus}/${booking.paymentStatus}`)
    })
    
    console.log('\n✅ All database tests passed!')
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    console.error('Full error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testDatabaseConnection()