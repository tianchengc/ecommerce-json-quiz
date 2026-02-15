import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Tea Quiz Widget - Find Your Perfect Tea',
  description: 'Take our personalized quiz to discover teas that match your taste preferences, lifestyle, and wellness goals.',
  keywords: ['tea', 'quiz', 'recommendation', 'personalized', 'tea finder'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
