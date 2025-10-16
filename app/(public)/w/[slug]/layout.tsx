import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../../../globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Image Gallery Widget - NotionWidgets Pro',
  description: 'Beautiful image gallery widget with filtering and gallery modal',
  other: {
    // Do not set X-Frame-Options at page level; CSP controls embedding
    'Content-Security-Policy': "frame-ancestors 'self' https://www.notion.so https://notion.so https://*.notion.so https://*.vercel.app https://vercel.app;",
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
