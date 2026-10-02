import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Temporarily disable middleware auth checks
  // Let client-side AdminGuard handle all authentication
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*'
  ]
}