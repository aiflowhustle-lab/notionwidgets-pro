import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Image Gallery Widget - NotionWidgets Pro',
  description: 'Beautiful image gallery widget with filtering and gallery modal',
  other: {
    'X-Frame-Options': 'ALLOWALL',
    'Content-Security-Policy': "frame-ancestors *",
  },
}

export default function WidgetLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
