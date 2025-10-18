import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Allow iframe embedding from all domains for maximum compatibility
  response.headers.delete('X-Frame-Options')
  response.headers.set('Content-Security-Policy', "frame-ancestors *;")
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Check if this is an iframe request (like from Notion)
  const userAgent = request.headers.get('user-agent') || ''
  const referer = request.headers.get('referer') || ''
  const isIframe = request.headers.get('sec-fetch-dest') === 'iframe' || 
                   referer.includes('notion.so') ||
                   userAgent.includes('Notion')
  
  // If it's an iframe request, redirect to the static embed route
  if (isIframe && request.nextUrl.pathname.startsWith('/w/')) {
    const slug = request.nextUrl.pathname.replace('/w/', '')
    const embedUrl = new URL(`/api/widget/${slug}/embed`, request.url)
    return NextResponse.redirect(embedUrl)
  }
  
  return response
}

export const config = {
  matcher: '/w/:path*',
}
