import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-display' })

export const metadata: Metadata = {
  title: 'Miss France Pronos - Top 5 entre amis',
  description: 'Pronostiquez le Top 5 de Miss France entre amis, sans compte ni adresse e-mail.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Miss France Pronos',
  },
}

export const viewport: Viewport = {
  themeColor: '#ec4899',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${playfair.variable} antialiased`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-gold-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
        {children}
      </body>
    </html>
  )
}