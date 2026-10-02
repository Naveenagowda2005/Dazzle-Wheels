/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [
      'res.cloudinary.com',
      'images.unsplash.com',
      'gqrwjafrebbgpvkfphzw.supabase.co',
    ],
  },
}

module.exports = nextConfig