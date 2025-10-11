import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Image Gallery Widget - NotionWidgets Pro',
  description: 'Beautiful image gallery widget with filtering and gallery modal',
  other: {
    'X-Frame-Options': 'SAMEORIGIN',
    'Content-Security-Policy': "frame-ancestors 'self' notion.so *.notion.so",
  },
}

export default function WidgetLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
