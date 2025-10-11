import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'NotionWidgets Pro - Image Gallery Widget',
  description: 'Beautiful image gallery widgets powered by NotionWidgets Pro',
  other: {
    'X-Frame-Options': 'ALLOWALL',
    'Content-Security-Policy': "frame-ancestors 'self' notion.so *.notion.so https://notion.so https://*.notion.so",
  },
}

export default function WidgetLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="X-Frame-Options" content="ALLOWALL" />
        <meta httpEquiv="Content-Security-Policy" content="frame-ancestors 'self' notion.so *.notion.so https://notion.so https://*.notion.so" />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}