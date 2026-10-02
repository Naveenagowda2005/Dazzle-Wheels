# 🚀 Supabase Database Setup for Dazzle Wheels

This guide will help you migrate from SQLite to Supabase (PostgreSQL) for dynamic database control.

## 📋 Prerequisites

1. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
2. **Node.js**: Ensure you have Node.js installed

## 🔧 Step-by-Step Setup

### 1. Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click **"New Project"**
3. Fill in project details:
   - **Name**: `dazzle-wheels`
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your location
4. Click **"Create new project"**
5. Wait for project initialization (2-3 minutes)

### 2. Get Database Connection Details

1. In your Supabase project dashboard, go to **Settings** → **Database**
2. Scroll down to **Connection string** section
3. Copy the **URI** connection string
4. It looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres`

### 3. Update Environment Variables

1. Open `backend/.env` file
2. Replace the DATABASE_URL and DIRECT_URL with your Supabase connection string:

```env
# Replace [YOUR-PASSWORD] with your actual database password
# Replace [YOUR-PROJECT-REF] with your actual project reference
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```

**Example:**
```env
DATABASE_URL="postgresql://postgres:mypassword123@db.abcdefghijklmnop.supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:mypassword123@db.abcdefghijklmnop.supabase.co:5432/postgres"
```

### 4. Install Dependencies and Migrate

```bash
# Navigate to backend directory
cd backend

# Install dependencies (if not already installed)
npm install

# Generate Prisma client for PostgreSQL
npx prisma generate

# Push schema to Supabase
npx prisma db push

# Run migration script to populate data
node migrate-to-supabase.js
```

### 5. Verify Setup

1. **Check Supabase Dashboard**:
   - Go to **Table Editor** in your Supabase project
   - You should see all tables: users, cars, bookings, payments, blogs, search_analytics, coupons

2. **Test Backend**:
   ```bash
   # Start the backend server
   npm run start:dev
   ```

3. **Test Frontend**:
   ```bash
   # In a new terminal, navigate to frontend
   cd ../frontend
   
   # Start frontend
   npm run dev
   ```

4. **Login Test**:
   - Visit: http://localhost:3000/login
   - Email: `admin@dazzlewheels.com`
   - Password: `admin123`

## 🎯 Benefits of Supabase

### ✅ **Dynamic Database Control**
- **Real-time Dashboard**: Manage data through Supabase's web interface
- **SQL Editor**: Run custom queries directly
- **Table Editor**: Add/edit/delete records with GUI
- **API Auto-generation**: REST and GraphQL APIs automatically created

### ✅ **Production Ready Features**
- **Automatic Backups**: Daily backups included
- **Scaling**: Automatic scaling based on usage
- **Security**: Row Level Security (RLS) policies
- **Real-time**: WebSocket connections for live updates

### ✅ **Advanced Features**
- **Authentication**: Built-in auth system (optional)
- **Storage**: File storage for images
- **Edge Functions**: Serverless functions
- **Analytics**: Built-in analytics dashboard

## 🔍 Managing Your Data

### Through Supabase Dashboard:

1. **View Data**: Table Editor → Select table → Browse records
2. **Add Records**: Click "Insert" → Fill form → Save
3. **Edit Records**: Click on any cell → Edit → Save
4. **Run Queries**: SQL Editor → Write SQL → Execute

### Through Admin Panel:

1. **Cars Management**: http://localhost:3000/admin → Cars tab
2. **Users Management**: Admin panel → Users tab
3. **Bookings**: Admin panel → Bookings tab
4. **Analytics**: Admin panel → Analytics tab

## 🚨 Important Notes

### Security:
- **Never commit** your actual database password to Git
- Use **environment variables** for all sensitive data
- Enable **Row Level Security** in production

### Backup:
- Supabase provides automatic daily backups
- For critical data, consider additional backup strategies

### Monitoring:
- Monitor database usage in Supabase dashboard
- Set up alerts for high usage or errors

## 🆘 Troubleshooting

### Connection Issues:
```bash
# Test connection
npx prisma db pull
```

### Schema Issues:
```bash
# Reset and re-push schema
npx prisma db push --force-reset
node migrate-to-supabase.js
```

### Data Issues:
```bash
# Re-run migration
node migrate-to-supabase.js
```

## 📞 Support

- **Supabase Docs**: [docs.supabase.com](https://docs.supabase.com)
- **Prisma Docs**: [prisma.io/docs](https://prisma.io/docs)
- **Community**: Supabase Discord / GitHub Issues

---

🎉 **Congratulations!** Your Dazzle Wheels platform is now powered by Supabase with full dynamic database control!