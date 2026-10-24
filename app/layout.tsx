import type { Metadata, Viewport } from 'next'
import { Manrope, Sora } from 'next/font/google'
import { BookingProvider } from '@/components/booking/booking-context'
import { DocumentLanguage } from '@/components/document-language'
import { SITE_IMAGE, SITE_ORIGIN, SITE_NAME } from '@/lib/seo'
import './globals.css'

const manrope = Manrope({
 subsets: ['latin'],
 variable: '--font-manrope',
 display: 'swap',
})

const sora = Sora({
 subsets: ['latin'],
 weight: ['300', '400', '500', '600', '700'],
 variable: '--font-sora',
 display: 'swap',
})

export const metadata: Metadata = {
 metadataBase: new URL(SITE_ORIGIN),
 title: {
  default: 'Casa vacanze sul Lago di Como',
  template: '%s | Crooked House',
 },
 description:
  'Casa vacanze a Naggio, Grandola ed Uniti: appartamento per 4 ospiti con giardino privato, vicino al Lago di Como e al Lago di Lugano.',
 openGraph: {
  type: 'website',
  siteName: SITE_NAME,
  title: 'Casa vacanze sul Lago di Como | Crooked House',
  description:
   'Casa vacanze a Naggio, Grandola ed Uniti: appartamento per 4 ospiti con giardino privato, vicino al Lago di Como e al Lago di Lugano.',
  locale: 'it_IT',
  images: [{ url: SITE_IMAGE, width: 1600, height: 900, alt: SITE_NAME }],
 },
 twitter: {
  card: 'summary_large_image',
  title: 'Casa vacanze sul Lago di Como | Crooked House',
  description:
   'Casa vacanze a Naggio, Grandola ed Uniti: appartamento per 4 ospiti con giardino privato, vicino al Lago di Como e al Lago di Lugano.',
  images: [SITE_IMAGE],
 },
 icons: {
  icon: [
   {
    url: '/icon-light-32x32.png',
    media: '(prefers-color-scheme: light)',
   },
   {
    url: '/icon-dark-32x32.png',
    media: '(prefers-color-scheme: dark)',
   },
   {
    url: '/icon.svg',
    type: 'image/svg+xml',
   },
  ],
  apple: '/apple-icon.png',
 },
}

export const viewport: Viewport = {
 colorScheme: 'light',
 themeColor: '#f0ece1',
}

export default function RootLayout({
 children,
}: Readonly<{
 children: React.ReactNode
}>) {
 return (
  <html
   lang="it"
   className={`light bg-background ${manrope.variable} ${sora.variable}`}
  >
   <body className="antialiased font-sans">
    <DocumentLanguage />
    <BookingProvider>{children}</BookingProvider>
   </body>
  </html>
 )
}
