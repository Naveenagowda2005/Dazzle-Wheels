import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gqrwjafrebbgpvkfphzw.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database types
export interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: 'USER' | 'ADMIN'
  created_at: string
  updated_at: string
}

export interface Car {
  id: string
  name: string
  brand: string
  fuel_type: string
  seats: number
  price_per_hour: number
  price_per_day: number
  city: string
  description?: string
  images: string
  availability: boolean
  created_at: string
  updated_at: string
}

export interface Booking {
  id: string
  booking_id: string
  user_id: string
  car_id: string
  pickup_time: string
  drop_time: string
  total_price: number
  payment_status: string
  booking_status: string
  driving_license?: string
  id_proof?: string
  created_at: string
  updated_at: string
  user?: User
  car?: Car
}

export interface Blog {
  id: string
  title: string
  slug: string
  content: string
  featured_image?: string
  meta_description?: string
  seo_keywords?: string
  category?: string
  published: boolean
  created_at: string
  updated_at: string
}

export interface Coupon {
  id: string
  code: string
  discount: number
  discount_type: string
  min_amount?: number
  max_discount?: number
  valid_from: string
  valid_to: string
  usage_limit?: number
  used_count: number
  active: boolean
  created_at: string
  updated_at: string
}