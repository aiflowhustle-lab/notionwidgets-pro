import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../../../globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Image Gallery Widget - NotionWidgets Pro',
  description: 'Beautiful image gallery widget with filtering and gallery modal',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  openGraph: {
    title: 'Image Gallery Widget - NotionWidgets Pro',
    description: 'Beautiful image gallery widget with filtering and gallery modal',
    type: 'website',
    url: 'https://notionwidgets-knvflb4ct-aixnews0-7575s-projects.vercel.app',
    siteName: 'NotionWidgets Pro',
    images: [
      {
        url: 'https://notionwidgets-knvflb4ct-aixnews0-7575s-projects.vercel.app/og-image.png',
        width: 1200,
        height: 630,
        alt: 'NotionWidgets Pro - Image Gallery Widget',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Image Gallery Widget - NotionWidgets Pro',
    description: 'Beautiful image gallery widget with filtering and gallery modal',
    images: ['https://notionwidgets-knvflb4ct-aixnews0-7575s-projects.vercel.app/og-image.png'],
  },
  other: {
    'Content-Security-Policy': "frame-ancestors *; object-src 'none';",
  },
}

export default function WidgetLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
