# 🔐 Admin Security Setup Guide

## ⚠️ **CRITICAL SECURITY NOTICE**

The current admin credentials are for **DEVELOPMENT ONLY** and must be changed before production deployment.

## 🚨 **Current Security Issues**

### ❌ **Demo Credentials Exposed**
- **Email**: `admin@dazzlewheels.com`
- **Password**: `admin123`
- **Risk**: Anyone can access admin panel with these credentials

### ❌ **Weak Password**
- Simple, predictable password
- No complexity requirements
- Easily guessable

## ✅ **Production Security Setup**

### 1. **Change Admin Credentials Immediately**

#### Option A: Through Database (Recommended)
```sql
-- Connect to your Supabase database and run:
UPDATE users 
SET 
  email = 'your-secure-admin@yourdomain.com',
  password = '$2b$10$your-hashed-secure-password'
WHERE role = 'ADMIN';
```

#### Option B: Through Admin Panel
1. Login with current credentials
2. Go to Users Management
3. Edit admin user
4. Change email and password
5. Save changes

#### Option C: Create New Admin User
```javascript
// Run this script in your backend
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createSecureAdmin() {
  const securePassword = 'YourVerySecurePassword123!@#';
  const hashedPassword = await bcrypt.hash(securePassword, 10);
  
  // Delete old admin
  await prisma.user.deleteMany({
    where: { role: 'ADMIN' }
  });
  
  // Create new secure admin
  const admin = await prisma.user.create({
    data: {
      name: 'System Administrator',
      email: 'admin@yourdomain.com', // Use your domain
      phone: '+1234567890',
      password: hashedPassword,
      role: 'ADMIN'
    }
  });
  
  console.log('Secure admin created:', admin.email);
}

createSecureAdmin();
```

### 2. **Password Requirements**

#### ✅ **Strong Password Criteria**
- Minimum 12 characters
- Mix of uppercase and lowercase
- Numbers and special characters
- No dictionary words
- No personal information

#### ✅ **Example Strong Passwords**
```
DazzleWheels2024!SecureAdmin
AdminPanel$2024#Secure
CarRental@Admin2024!Strong
```

### 3. **Additional Security Measures**

#### A. **Environment-Based Credentials**
```env
# backend/.env
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=YourVerySecurePassword123!
```

#### B. **Two-Factor Authentication (Future Enhancement)**
```typescript
// Add to user schema
model User {
  // ... existing fields
  twoFactorEnabled Boolean @default(false)
  twoFactorSecret  String?
}
```

#### C. **IP Whitelisting**
```typescript
// middleware.ts
const allowedAdminIPs = [
  '192.168.1.100', // Office IP
  '203.0.113.1'    // Home IP
];

if (pathname.startsWith('/admin')) {
  const clientIP = request.ip;
  if (!allowedAdminIPs.includes(clientIP)) {
    return NextResponse.redirect('/unauthorized');
  }
}
```

#### D. **Session Timeout**
```typescript
// Reduce admin session timeout
const adminSessionTimeout = 30 * 60 * 1000; // 30 minutes
```

### 4. **Remove Demo Credentials**

#### A. **Remove from Login Page**
The demo credentials section is now hidden in production:
```typescript
{process.env.NODE_ENV === 'development' && (
  // Demo credentials only shown in development
)}
```

#### B. **Remove from Documentation**
- Update README files
- Remove from deployment guides
- Clear from environment examples

### 5. **Audit and Monitoring**

#### A. **Enable Supabase Auth Logs**
1. Go to Supabase Dashboard
2. Navigate to **Logs** → **Auth**
3. Monitor login attempts
4. Set up alerts for failed attempts

#### B. **Database Audit Trail**
```sql
-- Create audit log table
CREATE TABLE admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### C. **Failed Login Monitoring**
```typescript
// Track failed admin login attempts
const failedAttempts = new Map();

// In login handler
if (loginFailed && isAdminAttempt) {
  const attempts = failedAttempts.get(ip) || 0;
  failedAttempts.set(ip, attempts + 1);
  
  if (attempts > 3) {
    // Block IP for 1 hour
    blockIP(ip, 3600000);
  }
}
```

## 🛡️ **Production Deployment Checklist**

### Before Going Live:

- [ ] **Change admin email** to your domain
- [ ] **Set strong admin password** (12+ characters)
- [ ] **Remove demo credentials** from UI
- [ ] **Update environment variables**
- [ ] **Enable HTTPS** for all admin routes
- [ ] **Set up IP whitelisting** (optional)
- [ ] **Configure session timeout**
- [ ] **Enable audit logging**
- [ ] **Test admin login** with new credentials
- [ ] **Document new credentials** securely

### Security Verification:

- [ ] **Cannot login** with old demo credentials
- [ ] **Strong password** enforced
- [ ] **HTTPS enabled** for admin routes
- [ ] **Session expires** after timeout
- [ ] **Failed attempts** are logged
- [ ] **No credentials** visible in UI

## 🚨 **Emergency Access Recovery**

If you lose admin access:

### Option 1: Database Direct Access
```sql
-- Reset admin password via Supabase SQL Editor
UPDATE users 
SET password = '$2b$10$NEW_HASHED_PASSWORD'
WHERE email = 'your-admin@domain.com' AND role = 'ADMIN';
```

### Option 2: Create Emergency Admin
```javascript
// Run migration script to create new admin
node create-emergency-admin.js
```

### Option 3: Backend Console Access
```bash
# SSH into your server and run
npm run create-admin -- --email=recovery@domain.com --password=TempPassword123!
```

## 📞 **Support**

For security-related issues:
- **Supabase Security**: [supabase.com/docs/guides/auth/auth-helpers](https://supabase.com/docs/guides/auth/auth-helpers)
- **Password Security**: [owasp.org/www-project-authentication-cheat-sheet](https://owasp.org/www-project-authentication-cheat-sheet/)
- **Session Management**: [owasp.org/www-project-session-management-cheat-sheet](https://owasp.org/www-project-session-management-cheat-sheet/)

---

⚠️ **REMEMBER**: Security is not optional. Always use strong, unique credentials for production systems!