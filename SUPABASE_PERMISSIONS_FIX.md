# Supabase Permissions Fix 🔧

## Issue Identified
The error "permission denied for schema public" indicates that the service role doesn't have proper permissions to access the public schema, not just RLS issues.

## 🚀 Complete Fix - Run These SQL Commands

Go to **Supabase Dashboard > SQL Editor** and run this complete script:

```sql
-- 1. Grant schema permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

-- 2. Grant table permissions to service_role
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- 3. Grant table permissions to anon (for public access)
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;

-- 4. Disable RLS on all tables
ALTER TABLE IF EXISTS cars DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS blogs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS coupons DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS search_analytics DISABLE ROW LEVEL SECURITY;

-- 5. Set default permissions for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO authenticated;

-- 6. Verify permissions
SELECT 
    schemaname, 
    tablename, 
    tableowner,
    rowsecurity,
    hasindexes
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- 7. Show current role permissions
SELECT 
    grantee, 
    table_schema, 
    table_name, 
    privilege_type 
FROM information_schema.table_privileges 
WHERE table_schema = 'public' 
AND grantee IN ('anon', 'authenticated', 'service_role')
ORDER BY table_name, grantee;
```

## 🔍 Alternative: Check Your Tables Exist

Run this to verify your tables are actually in the public schema:

```sql
-- Check if tables exist
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('cars', 'users', 'bookings', 'blogs', 'coupons', 'payments', 'search_analytics');

-- Check table owners
SELECT tablename, tableowner 
FROM pg_tables 
WHERE schemaname = 'public';
```

## 🛠️ If Tables Don't Exist

If the tables don't exist, you need to create them first. Run the schema creation:

```sql
-- Create tables (if they don't exist)
CREATE TABLE IF NOT EXISTS cars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    price_per_day DECIMAL(10,2) NOT NULL,
    fuel_type VARCHAR(50) NOT NULL,
    transmission VARCHAR(50) NOT NULL,
    seats INTEGER NOT NULL,
    image_url TEXT,
    images TEXT[],
    features TEXT[],
    available BOOLEAN DEFAULT true,
    location VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'USER',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add other tables as needed...
```

## 🧪 Test After Fix

After running the permissions fix, test with:

```bash
node backend/test-supabase-direct.js
```

You should see:
```
✅ Success - Found X records
📋 Sample data: { actual data }
```

## 🎯 Expected Results

After fixing permissions:
1. ✅ Service role can access all tables
2. ✅ Anon role can read public data
3. ✅ RLS is disabled for development
4. ✅ Your app will fetch real data
5. ✅ Admin dashboard shows actual analytics

---

**Run the SQL script above and then test again!** 🚀