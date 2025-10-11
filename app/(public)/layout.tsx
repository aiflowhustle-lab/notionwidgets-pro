import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'NotionWidgets Pro - Image Gallery Widget',
  description: 'Beautiful image gallery widgets powered by NotionWidgets Pro',
  other: {
    'X-Frame-Options': 'SAMEORIGIN',
    'Content-Security-Policy': "frame-ancestors 'self' notion.so *.notion.so",
  },
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
