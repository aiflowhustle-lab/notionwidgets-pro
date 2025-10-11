import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Allow iframe embedding from any domain by removing X-Frame-Options
  // and setting permissive CSP
  response.headers.delete('X-Frame-Options')
  response.headers.set('Content-Security-Policy', "frame-ancestors *; object-src 'none';")
  response.headers.set('X-Content-Type-Options', 'nosniff')
  
  // Add CORS headers for iframe embedding
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  
  return response
}

export const config = {
  matcher: '/w/:path*',
}
