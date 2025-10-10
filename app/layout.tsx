import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ConditionalAuthProvider } from '@/lib/auth'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NotionWidgets Pro - Transform Your Notion Images Into Beautiful Widgets',
  description: 'Create embeddable image gallery widgets from your Notion databases. Perfect for showcasing your content across platforms.',
  keywords: 'notion, widgets, gallery, images, embed, saas',
  authors: [{ name: 'NotionWidgets Pro' }],
  openGraph: {
    title: 'NotionWidgets Pro',
    description: 'Transform Your Notion Images Into Beautiful Widgets',
    type: 'website',
    locale: 'en_US',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ConditionalAuthProvider>
          {children}
        </ConditionalAuthProvider>
      </body>
    </html>
  )
}
