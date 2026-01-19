import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Salesforce Metadata Mind Map',
  description: 'Visualize your Salesforce org metadata in a mind map format',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
