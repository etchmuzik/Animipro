import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Bricolage_Grotesque, Noto_Sans_Arabic } from 'next/font/google'
import './globals.css'
import './theme.css'
import { DirController } from '@/components/dir-controller'
import { BrandController } from '@/components/brand-controller'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

// Display face for marketing headlines only (the app UI stays on Geist).
// Bricolage Grotesque: humanist grotesque with warmth + bite — reads as
// energetic and operational at huge sizes without tipping into editorial.
const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['600', '700', '800'],
  display: 'swap',
})

// Arabic UI font — applied under [lang="ar"]. Without this, Arabic fell back to
// a Latin face (the existing `font-arabic` class was referenced but undefined).
const notoArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  variable: '--font-arabic',
  weight: ['400', '500', '700'],
  display: 'swap',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0e7490',
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  // metadataBase makes relative OG/Twitter image URLs resolve to absolute ones,
  // which social crawlers require.
  metadataBase: new URL('https://animipro.online'),
  title: 'Animipro — Hotel Animation Team Management for Egyptian Resorts',
  description: 'The #1 platform for hotel animation teams across Egypt. Schedule teams, track TripAdvisor ratings, manage performance in Sharm El Sheikh, Hurghada, El Gouna, Dahab, Marsa Alam, Ain Sokhna, Taba and more. One-off payment. White-label available.',
  generator: 'Animipro',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Animipro',
  },
  formatDetection: {
    telephone: false,
  },
  keywords: [
    'hotel animation management Egypt',
    'resort entertainment software',
    'animation team scheduling',
    'sharm el sheikh hotel management',
    'hurghada resort animation',
    'el gouna hotel software',
    'marsa alam resort management',
    'dahab hotel animation',
    'ain sokhna resort software',
    'taba heights hotel management',
    'makadi bay animation software',
    'sahl hasheesh resort entertainment',
    'TripAdvisor hotel rating tracker',
    'white label hotel software Egypt',
    'hotel performance management Egypt',
    'animation chief software',
  ],
  openGraph: {
    title: 'Animipro — Hotel Animation Team Management',
    description: 'Manage animation teams across all Egyptian resort destinations. Smart scheduling, TripAdvisor tracking, performance KPIs.',
    type: 'website',
    siteName: 'Animipro',
    locale: 'en_US',
    url: '/',
    // NOTE: this is the 512x512 app icon (square). A dedicated 1200x630 social
    // card is a future improvement for better link-preview cropping.
    images: [{ url: '/icons/icon-512x512.png', width: 512, height: 512, alt: 'Animipro' }],
  },
  twitter: {
    card: 'summary',
    title: 'Animipro — Hotel Animation Team Management',
    description: 'Manage animation teams across all Egyptian resort destinations. Smart scheduling, TripAdvisor tracking, performance KPIs.',
    images: ['/icons/icon-512x512.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Animipro" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="msapplication-TileColor" content="#141418" />
        <meta name="msapplication-TileImage" content="/icons/icon-144x144.png" />
      </head>
      <body className={`${geist.variable} ${geistMono.variable} ${bricolage.variable} ${notoArabic.variable} font-sans antialiased`}>
        <DirController />
        <BrandController />
        {children}
      </body>
    </html>
  )
}
