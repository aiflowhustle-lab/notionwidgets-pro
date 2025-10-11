import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Allow iframe embedding from Notion domains
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('Content-Security-Policy', "frame-ancestors 'self' notion.so *.notion.so")
  
  return response
}

export const config = {
  matcher: '/w/:path*',
}
