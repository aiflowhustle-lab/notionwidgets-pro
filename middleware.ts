import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Allow iframe embedding from Notion domains
  // Do NOT set X-Frame-Options; CSP frame-ancestors controls embedding
  response.headers.delete('X-Frame-Options')
  response.headers.set('Content-Security-Policy', "frame-ancestors *;")
  
  return response
}

export const config = {
  matcher: '/w/:path*',
}
