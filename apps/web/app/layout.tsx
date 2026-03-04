import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Zyra — Your AI Health Platform',
  description: 'Connect your health data, get AI-powered insights and recommendations',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
