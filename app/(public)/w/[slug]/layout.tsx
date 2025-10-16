import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../../../globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Image Gallery Widget - NotionWidgets Pro',
  description: 'Beautiful image gallery widget with filtering and gallery modal',
  other: {
    // Allow iframe embedding from any origin for iPad compatibility
    'Content-Security-Policy': "frame-ancestors *; object-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;",
    'X-Frame-Options': 'ALLOWALL',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  },
}

export default function WidgetLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
