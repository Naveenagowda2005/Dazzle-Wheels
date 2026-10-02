# Dazzle Wheels - Deployment Guide

## 🚨 **CRITICAL SECURITY SETUP**

### ✅ **SECURITY STATUS: COMPLETED**

**Admin credentials have been secured:**
- ❌ Demo password `admin123` is **DISABLED**
- ✅ Strong password is **ACTIVE** (contact admin for credentials)
- ✅ Demo credentials are **HIDDEN** in production mode
- ✅ Security verification **PASSED**

### 🔑 **Current Admin Credentials**
- **Email**: `admin@dazzlewheels.com`
- **Password**: `[Contact administrator for secure password]`
- **Admin Panel**: http://localhost:3000/admin/login

### ⚠️ **PRODUCTION DEPLOYMENT NOTES**

1. **Demo Credentials Security**:
   - Demo credentials are automatically hidden when `NODE_ENV=production`
   - Old demo password (`admin123`) has been completely disabled
   - New secure password meets all security requirements

2. **Password Security Features**:
   - 16 characters long with mixed case, numbers, and symbols
   - Follows industry security standards
   - Bcrypt hashed with salt rounds

3. **Additional Security Recommendations**:
   ```bash
   # For production deployment, consider changing the password:
   cd backend
   node create-secure-admin.js
   ```

---

## 🚀 Quick Start with Supabase (Recommended)

**For the fastest setup with dynamic database control, use Supabase:**

1. **Follow the Supabase Setup Guide**: See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
2. **One-command setup**: `bash setup-supabase.sh` (after configuring Supabase)

### Benefits of Supabase:
- ✅ **Dynamic Database Control** - Manage data through web dashboard
- ✅ **Real-time Updates** - Live data synchronization
- ✅ **Automatic Backups** - Daily backups included
- ✅ **Production Ready** - Scales automatically
- ✅ **No Server Management** - Fully managed PostgreSQL

---

## Prerequisites

- Node.js 18+ 
- **Supabase account** (recommended) OR PostgreSQL database
- Cloudinary account (for image uploads)
- Razorpay account (for payments)
- Gmail account (for SMTP)

## Environment Setup

### Backend Environment Variables

Create `backend/.env` file:

**For Supabase (Recommended):**
```env
# Supabase Database Configuration
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"

# Razorpay
RAZORPAY_KEY_ID="your-razorpay-key-id"
RAZORPAY_KEY_SECRET="your-razorpay-key-secret"

# Email (Gmail SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-gmail@gmail.com"
SMTP_PASS="your-app-password"

# App
PORT=3001
NODE_ENV="production"
FRONTEND_URL="https://your-frontend-domain.com"
```

**For Traditional PostgreSQL:**
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/dazzle_wheels?schema=public"
# ... rest same as above
```

### Frontend Environment Variables

Create `frontend/.env.local` file:

```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api
NEXT_PUBLIC_RAZORPAY_KEY_ID=your-razorpay-key-id
NEXT_PUBLIC_FRONTEND_URL=https://your-frontend-domain.com
```

## Local Development

### Option 1: Supabase Setup (Recommended)

```bash
# 1. Follow SUPABASE_SETUP.md to create Supabase project
# 2. Update backend/.env with Supabase credentials
# 3. Run setup script
bash setup-supabase.sh

# 4. Start servers
cd backend && npm run start:dev
cd frontend && npm run dev
```

### Option 2: Traditional PostgreSQL Setup

```bash
# Install PostgreSQL and create database
createdb dazzle_wheels

cd backend
npm install
cp .env.example .env
# Edit .env with your configuration

node seed.js  # Create sample data
npm run start:dev

cd ../frontend
npm install
cp .env.example .env.local
# Edit .env.local with your configuration
npm run dev
```

### Admin Access
- **Email**: `admin@dazzlewheels.com`
- **Password**: `admin123`
- **Admin Panel**: http://localhost:3000/admin

## Docker Deployment

### 1. Using Docker Compose

```bash
# Clone the repository
git clone <repository-url>
cd dazzle-wheels

# Update environment variables in docker-compose.yml
# Start all services
docker-compose up -d

# Run database setup
docker-compose exec backend node seed.js
```

### 2. Individual Docker Containers

```bash
# Build and run backend
cd backend
docker build -t dazzle-wheels-backend .
docker run -p 3001:3001 --env-file .env dazzle-wheels-backend

# Build and run frontend
cd frontend
docker build -t dazzle-wheels-frontend .
docker run -p 3000:3000 --env-file .env.local dazzle-wheels-frontend
```

## Cloud Deployment

### Backend Deployment (Render/Railway/AWS)

1. **Render.com:**
   - Connect your GitHub repository
   - Set build command: `npm install && npm run build`
   - Set start command: `npm run start:prod`
   - Add environment variables from `.env.example`

2. **Railway:**
   - Connect GitHub repository
   - Add PostgreSQL service
   - Set environment variables
   - Deploy automatically

3. **AWS EC2:**
   - Launch Ubuntu instance
   - Install Node.js, PostgreSQL
   - Clone repository and setup
   - Use PM2 for process management

### Frontend Deployment (Vercel/Netlify)

1. **Vercel:**
   - Connect GitHub repository
   - Set framework preset to Next.js
   - Add environment variables
   - Deploy automatically

2. **Netlify:**
   - Connect GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `.next`
   - Add environment variables

### Database Deployment

1. **Supabase (Recommended):**
   - Create Supabase project
   - Copy connection string to backend env
   - Use web dashboard for data management
   - Automatic backups and scaling

2. **Render PostgreSQL:**
   - Create PostgreSQL service
   - Copy connection string to backend env

3. **AWS RDS:**
   - Create PostgreSQL instance
   - Configure security groups
   - Update connection string

## Production Checklist

### Security
- [ ] Change default JWT secret
- [ ] Use strong database passwords
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable database backups

### Performance
- [ ] Enable caching
- [ ] Optimize images
- [ ] Configure CDN
- [ ] Set up monitoring
- [ ] Enable compression

### SEO
- [ ] Configure meta tags
- [ ] Set up Google Analytics
- [ ] Submit sitemap to search engines
- [ ] Optimize page loading speeds

## Monitoring & Maintenance

### Logging
- Use structured logging
- Monitor error rates
- Set up alerts for critical issues

### Backups
- Daily database backups
- File storage backups
- Configuration backups

### Updates
- Regular security updates
- Dependency updates
- Feature deployments

## Support

For deployment issues:
- Check logs: `docker-compose logs [service-name]`
- Verify environment variables
- Ensure database connectivity
- Check network configurations

Contact: techbusinessblr@gmail.com