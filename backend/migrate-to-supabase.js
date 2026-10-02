const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function migrateToSupabase() {
  try {
    console.log('🚀 Starting migration to Supabase...')

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@dazzlewheels.com' },
      update: {},
      create: {
        name: 'Admin User',
        email: 'admin@dazzlewheels.com',
        phone: '+917760322345',
        password: hashedPassword,
        role: 'ADMIN'
      }
    })

    console.log('✅ Admin user created:', adminUser.email)

    // Create sample cars
    const cars = [
      {
        name: 'Maruti Swift',
        brand: 'Maruti Suzuki',
        fuelType: 'Petrol',
        seats: 5,
        pricePerHour: 150,
        pricePerDay: 2500,
        city: 'Bangalore',
        description: 'Compact and fuel-efficient car perfect for city drives',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1549924231-f129b911e442?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ]),
        availability: true
      },
      {
        name: 'Honda City',
        brand: 'Honda',
        fuelType: 'Petrol',
        seats: 5,
        pricePerHour: 200,
        pricePerDay: 3500,
        city: 'Bangalore',
        description: 'Premium sedan with excellent comfort and performance',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1563720223185-11003d516935?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1550355291-bbee04a92027?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ]),
        availability: true
      },
      {
        name: 'Hyundai Creta',
        brand: 'Hyundai',
        fuelType: 'Diesel',
        seats: 5,
        pricePerHour: 250,
        pricePerDay: 4000,
        city: 'Bangalore',
        description: 'Stylish SUV with advanced features and spacious interior',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1581540222194-0def2dda95b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ]),
        availability: true
      },
      {
        name: 'Mahindra XUV700',
        brand: 'Mahindra',
        fuelType: 'Diesel',
        seats: 7,
        pricePerHour: 300,
        pricePerDay: 5000,
        city: 'Bangalore',
        description: 'Premium 7-seater SUV with cutting-edge technology',
        images: JSON.stringify([
          'https://images.unsplash.com/photo-1609521263047-f8f205293f24?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ]),
        availability: true
      }
    ]

    // Clear existing cars first
    await prisma.car.deleteMany({})
    
    for (const carData of cars) {
      const car = await prisma.car.create({
        data: carData
      })
      console.log('✅ Car created:', car.name)
    }

    // Create sample blog posts
    const blogs = [
      {
        title: 'Top 10 Car Rental Tips for First-Time Users',
        slug: 'top-10-car-rental-tips-first-time-users',
        content: 'Renting a car for the first time can be overwhelming. Here are our top 10 tips to make your experience smooth and enjoyable...',
        featuredImage: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        metaDescription: 'Essential car rental tips for first-time users. Learn how to get the best deals and avoid common mistakes.',
        seoKeywords: 'car rental tips, first time car rental, car rental guide',
        category: 'Tips & Guides',
        published: true
      },
      {
        title: 'Best Cars for Bangalore City Driving',
        slug: 'best-cars-bangalore-city-driving',
        content: 'Bangalore traffic requires the right vehicle. Discover which cars work best for city navigation and comfort...',
        featuredImage: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        metaDescription: 'Find the perfect car for Bangalore city driving. Compare fuel efficiency, comfort, and maneuverability.',
        seoKeywords: 'bangalore car rental, city driving cars, best cars bangalore',
        category: 'City Guides',
        published: true
      }
    ]

    // Clear existing blogs first
    await prisma.blog.deleteMany({})

    for (const blogData of blogs) {
      const blog = await prisma.blog.create({
        data: blogData
      })
      console.log('✅ Blog created:', blog.title)
    }

    // Create sample coupons
    const coupons = [
      {
        code: 'WELCOME20',
        discount: 20,
        discountType: 'PERCENTAGE',
        minAmount: 1000,
        maxDiscount: 500,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        usageLimit: 100,
        active: true
      },
      {
        code: 'FIRSTRIDE',
        discount: 300,
        discountType: 'FIXED',
        minAmount: 2000,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        usageLimit: 50,
        active: true
      }
    ]

    // Clear existing coupons first
    await prisma.coupon.deleteMany({})

    for (const couponData of coupons) {
      const coupon = await prisma.coupon.create({
        data: couponData
      })
      console.log('✅ Coupon created:', coupon.code)
    }

    console.log('🎉 Migration to Supabase completed successfully!')
    console.log('\n📊 Summary:')
    console.log('- Admin user: admin@dazzlewheels.com / admin123')
    console.log('- Sample cars: 4 vehicles added')
    console.log('- Sample blogs: 2 posts added')
    console.log('- Sample coupons: 2 coupons added')
    console.log('\n🌐 Your Dazzle Wheels platform is ready!')

  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

migrateToSupabase()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })