import type { Metadata, Viewport } from 'next'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import Script from 'next/script'
import { AnnouncementBanner } from '@/components/announcement-banner'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const SITE_URL = 'https://iibeautybyamyii.com'
const SITE_NAME = 'BeautyByAmy'
const DEFAULT_DESCRIPTION =
  'BeautyByAmy offers eyelash extensions, microblading, ombré brows, lip blush, and brow services in Mobile, AL. Book online at Charm Nail Lounge — certified specialist, luxury results.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: `${SITE_NAME} | Eyelash Extensions & Permanent Makeup in Mobile, AL`,
    template: `%s | ${SITE_NAME} · Mobile, AL`,
  },

  description: DEFAULT_DESCRIPTION,

  keywords: [
    'eyelash extensions Mobile AL',
    'lash extensions Mobile Alabama',
    'microblading Mobile AL',
    'ombré brows Mobile AL',
    'brow tinting Mobile Alabama',
    'brow services Mobile AL',
    'permanent makeup Mobile AL',
    'lip blush Mobile AL',
    'beauty salon Mobile Alabama',
    'lash salon near me Mobile',
    'BeautyByAmy',
    'Amy Le lashes',
    'Charm Nail Lounge Mobile AL',
  ],

  authors: [{ name: 'Amy Le', url: SITE_URL }],
  creator: 'BeautyByAmy',

  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Eyelash Extensions & Permanent Makeup in Mobile, AL`,
    description: DEFAULT_DESCRIPTION,
  },

  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} | Mobile, AL`,
    description: DEFAULT_DESCRIPTION,
  },

  alternates: {
    canonical: SITE_URL,
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png',  media: '(prefers-color-scheme: dark)'  },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#FAF8F5',
  width: 'device-width',
  initialScale: 1,
}

// JSON-LD Local Business schema — highest-leverage SEO signal for local "near me" searches.
// This hardcoded constant is the sole source — no user input reaches it, so it is safe.
const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'BeautySalon',
  name: 'BeautyByAmy',
  alternateName: 'Beauty By Amy',
  description: DEFAULT_DESCRIPTION,
  url: SITE_URL,
  telephone: '+12512732769',
  email: 'beautybyamyle@gmail.com',
  priceRange: '$$',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '100 N Florida St Building E-3',
    addressLocality: 'Mobile',
    addressRegion: 'AL',
    postalCode: '36607',
    addressCountry: 'US',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 30.6946,
    longitude: -88.0431,
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '09:00',
      closes: '18:00',
    },
  ],
  sameAs: [
    'https://www.instagram.com/iibeautybyamyii/',
    'https://www.facebook.com/iibeautybyamy/',
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Beauty Services',
    itemListElement: [
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Eyelash Extensions', description: 'Classic, hybrid, and volume lash sets in Mobile, AL' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Microblading', description: 'Semi-permanent brow tattooing in Mobile, AL' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Ombré Brows', description: 'Powder-effect semi-permanent brow treatment in Mobile, AL' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Lip Blush', description: 'Semi-permanent lip colour and definition in Mobile, AL' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Brow Tint & Wax', description: 'Brow shaping and tinting services in Mobile, AL' } },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="font-sans antialiased">
        {/* Structured data for local search — content is a hardcoded constant, not user input */}
        <Script
          id="local-business-schema"
          type="application/ld+json"
          strategy="beforeInteractive"
        >
          {JSON.stringify(localBusinessSchema)}
        </Script>
        <AnnouncementBanner />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
