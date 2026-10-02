const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const readline = require('readline')

const prisma = new PrismaClient()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(query) {
  return new Promise(resolve => rl.question(query, resolve))
}

function questionHidden(query) {
  return new Promise(resolve => {
    process.stdout.write(query)
    process.stdin.setRawMode(true)
    process.stdin.resume()
    process.stdin.setEncoding('utf8')
    
    let password = ''
    process.stdin.on('data', function(char) {
      char = char + ''
      
      switch(char) {
        case '\n':
        case '\r':
        case '\u0004':
          process.stdin.setRawMode(false)
          process.stdin.pause()
          process.stdout.write('\n')
          resolve(password)
          break
        case '\u0003':
          process.exit()
          break
        default:
          password += char
          process.stdout.write('*')
          break
      }
    })
  })
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function validatePassword(password) {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  return passwordRegex.test(password)
}

async function createSecureAdmin() {
  try {
    console.log('🔐 Secure Admin Creation Tool')
    console.log('================================')
    console.log('')
    
    // Get admin details
    let email, name, phone, password, confirmPassword
    
    // Name
    name = await question('Enter admin full name: ')
    if (!name.trim()) {
      console.log('❌ Name cannot be empty')
      process.exit(1)
    }
    
    // Email
    do {
      email = await question('Enter admin email: ')
      if (!validateEmail(email)) {
        console.log('❌ Please enter a valid email address')
      }
    } while (!validateEmail(email))
    
    // Phone
    phone = await question('Enter admin phone (optional): ')
    
    // Password
    do {
      password = await questionHidden('Enter secure password (min 8 chars, mixed case, numbers, symbols): ')
      if (!validatePassword(password)) {
        console.log('❌ Password must be at least 8 characters with uppercase, lowercase, number, and symbol')
      }
    } while (!validatePassword(password))
    
    // Confirm password
    do {
      confirmPassword = await questionHidden('Confirm password: ')
      if (password !== confirmPassword) {
        console.log('❌ Passwords do not match')
      }
    } while (password !== confirmPassword)
    
    console.log('')
    console.log('Creating secure admin user...')
    
    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })
    
    if (existingAdmin) {
      const replace = await question(`⚠️  Admin user already exists (${existingAdmin.email}). Replace? (y/N): `)
      if (replace.toLowerCase() !== 'y') {
        console.log('Operation cancelled.')
        process.exit(0)
      }
      
      // Delete existing admin
      await prisma.user.deleteMany({
        where: { role: 'ADMIN' }
      })
      console.log('✅ Existing admin user removed')
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Create new admin
    const admin = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim() || null,
        password: hashedPassword,
        role: 'ADMIN'
      }
    })
    
    console.log('')
    console.log('🎉 Secure admin user created successfully!')
    console.log('=====================================')
    console.log(`Name: ${admin.name}`)
    console.log(`Email: ${admin.email}`)
    console.log(`Phone: ${admin.phone || 'Not provided'}`)
    console.log(`Role: ${admin.role}`)
    console.log('')
    console.log('⚠️  IMPORTANT SECURITY NOTES:')
    console.log('- Store these credentials securely')
    console.log('- Do not share the password')
    console.log('- Consider enabling 2FA in production')
    console.log('- Remove demo credentials from UI')
    console.log('- Use HTTPS in production')
    console.log('')
    console.log('🔗 Admin login URL: http://localhost:3000/admin/login')
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error)
    throw error
  } finally {
    await prisma.$disconnect()
    rl.close()
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n\nOperation cancelled by user.')
  rl.close()
  process.exit(0)
})

createSecureAdmin()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })